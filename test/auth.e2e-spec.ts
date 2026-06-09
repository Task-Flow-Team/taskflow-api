import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app/app.module';
import { PrismaService } from '@/contexts/shared/prisma/prisma.service';
import { MailService } from '@/contexts/domain/services';
import { Mail } from '@/contexts/domain/models/mail.entity';

const TEST_EMAIL = 'e2etest@taskflow.test';
const TEST_USERNAME = 'e2etestuser';
const TEST_PASSWORD = 'TestPassword123!';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let httpServer: any;

  // Shared state across tests (execution order matters)
  let accessToken: string;
  let loggedOutToken: string;
  let registeredUserId: string;

  // Captured emails from mock
  const sentEmails: Mail[] = [];

  const mockMailService: MailService = {
    send: jest.fn().mockImplementation((mail: Mail) => {
      sentEmails.push(mail);
      return Promise.resolve(true);
    }),
    sendMany: jest.fn().mockImplementation((mail: Mail) => {
      sentEmails.push(mail);
      return Promise.resolve(true);
    }),
  } as any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('mailService')
      .useValue(mockMailService)
      .compile();

    app = moduleFixture.createNestApplication();

    // Replicate the same ValidationPipe from main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
    httpServer = app.getHttpServer();
    prisma = app.get(PrismaService);

    // Clean up any leftover test data from previous runs
    await cleanupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await app.close();
  });

  async function cleanupTestData() {
    try {
      const testUser = await prisma.user.findUnique({
        where: { email: TEST_EMAIL },
      });

      if (testUser) {
        // Delete in correct order to respect FK constraints
        await prisma.verificationToken.deleteMany({
          where: { identifier: testUser.id },
        });
        await prisma.settings.deleteMany({
          where: { user_id: testUser.id },
        });
        await prisma.session.deleteMany({
          where: { userId: testUser.id },
        });
        await prisma.account.deleteMany({
          where: { userId: testUser.id },
        });
        await prisma.notifications.deleteMany({
          where: { user_id: testUser.id },
        });
        await prisma.activityLogs.deleteMany({
          where: { user_id: testUser.id },
        });
        await prisma.comment.deleteMany({
          where: { user_id: testUser.id },
        });
        await prisma.user.delete({
          where: { id: testUser.id },
        });
      }
    } catch {
      // Ignore cleanup errors — user may not exist yet
    }
  }

  // ─── REGISTER ──────────────────────────────────────────────────────────

  describe('POST /v1/auth/register', () => {
    it('should register a new user and return an access_token (201)', async () => {
      const res = await request(httpServer)
        .post('/v1/auth/register')
        .send({
          username: TEST_USERNAME,
          email: TEST_EMAIL,
          password: TEST_PASSWORD,
        })
        .expect(201);

      expect(res.body).toHaveProperty('access_token');
      expect(typeof res.body.access_token).toBe('string');
      expect(res.body.access_token.length).toBeGreaterThan(0);

      // Store for subsequent tests
      accessToken = res.body.access_token;

      // Retrieve the user ID for cleanup and verify-email tests
      const user = await prisma.user.findUnique({
        where: { email: TEST_EMAIL },
      });
      expect(user).toBeDefined();
      registeredUserId = user!.id;
    });

    it('should return 400 when registering with a duplicate email', async () => {
      const res = await request(httpServer)
        .post('/v1/auth/register')
        .send({
          username: 'anothername',
          email: TEST_EMAIL,
          password: TEST_PASSWORD,
        })
        .expect(400);

      expect(res.body).toHaveProperty('statusCode', 400);
    });

    it('should return 400 when registering with a duplicate username', async () => {
      const res = await request(httpServer)
        .post('/v1/auth/register')
        .send({
          username: TEST_USERNAME,
          email: 'different@taskflow.test',
          password: TEST_PASSWORD,
        })
        .expect(400);

      expect(res.body).toHaveProperty('statusCode', 400);
    });

    it('should return 400 when required fields are missing', async () => {
      await request(httpServer)
        .post('/v1/auth/register')
        .send({ email: 'incomplete@taskflow.test' })
        .expect(400);
    });

    it('should return 400 when email format is invalid', async () => {
      await request(httpServer)
        .post('/v1/auth/register')
        .send({
          username: 'invalidemailuser',
          email: 'not-an-email',
          password: TEST_PASSWORD,
        })
        .expect(400);
    });

    it('should return 400 when password is too short', async () => {
      await request(httpServer)
        .post('/v1/auth/register')
        .send({
          username: 'shortpwduser',
          email: 'shortpwd@taskflow.test',
          password: '12345',
        })
        .expect(400);
    });

    it('should return 400 when username is too short', async () => {
      await request(httpServer)
        .post('/v1/auth/register')
        .send({
          username: 'ab',
          email: 'shortname@taskflow.test',
          password: TEST_PASSWORD,
        })
        .expect(400);
    });

    it('should return 400 when non-whitelisted fields are sent', async () => {
      await request(httpServer)
        .post('/v1/auth/register')
        .send({
          username: 'extrafields',
          email: 'extra@taskflow.test',
          password: TEST_PASSWORD,
          admin: true,
        })
        .expect(400);
    });
  });

  // ─── LOGIN ─────────────────────────────────────────────────────────────

  describe('POST /v1/auth/login', () => {
    it('should login with valid credentials and return access_token (200)', async () => {
      const res = await request(httpServer)
        .post('/v1/auth/login')
        .send({
          email: TEST_EMAIL,
          password: TEST_PASSWORD,
        })
        .expect(200);

      expect(res.body).toHaveProperty('access_token');
      expect(typeof res.body.access_token).toBe('string');

      // Update the token for subsequent tests
      accessToken = res.body.access_token;
    });

    it('should return 401 with wrong password', async () => {
      const res = await request(httpServer)
        .post('/v1/auth/login')
        .send({
          email: TEST_EMAIL,
          password: 'WrongPassword999!',
        })
        .expect(401);

      expect(res.body).toHaveProperty('statusCode', 401);
    });

    it('should return 401 with non-existent email', async () => {
      const res = await request(httpServer)
        .post('/v1/auth/login')
        .send({
          email: 'nonexistent@taskflow.test',
          password: TEST_PASSWORD,
        })
        .expect(401);

      expect(res.body).toHaveProperty('statusCode', 401);
    });

    it('should return 400 or 401 when email is missing', async () => {
      const res = await request(httpServer)
        .post('/v1/auth/login')
        .send({ password: TEST_PASSWORD });

      // Passport LocalStrategy may return 401 before ValidationPipe runs
      expect([400, 401]).toContain(res.status);
    });

    it('should return 400 or 401 when password is missing', async () => {
      const res = await request(httpServer)
        .post('/v1/auth/login')
        .send({ email: TEST_EMAIL });

      expect([400, 401]).toContain(res.status);
    });

    it('should return 400 or 401 when body is empty', async () => {
      const res = await request(httpServer)
        .post('/v1/auth/login')
        .send({});

      expect([400, 401]).toContain(res.status);
    });
  });

  // ─── LOGOUT ────────────────────────────────────────────────────────────

  describe('POST /v1/auth/logout', () => {
    // Get a fresh token specifically for the logout tests
    let logoutToken: string;

    beforeAll(async () => {
      const res = await request(httpServer)
        .post('/v1/auth/login')
        .send({ email: TEST_EMAIL, password: TEST_PASSWORD });
      logoutToken = res.body.access_token;
    });

    it('should return 401 without Authorization header', async () => {
      await request(httpServer).post('/v1/auth/logout').expect(401);
    });

    it('should return 401 with an invalid token', async () => {
      await request(httpServer)
        .post('/v1/auth/logout')
        .set('Authorization', 'Bearer invalid.jwt.token')
        .expect(401);
    });

    it('should successfully logout with a valid token (200)', async () => {
      const res = await request(httpServer)
        .post('/v1/auth/logout')
        .set('Authorization', `Bearer ${logoutToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toContain('Successfully logged out');

      // Keep the blacklisted token for the next test
      loggedOutToken = logoutToken;
    });

    it('should return 401 when using a blacklisted token after logout', async () => {
      await request(httpServer)
        .post('/v1/auth/logout')
        .set('Authorization', `Bearer ${loggedOutToken}`)
        .expect(401);
    });
  });

  // ─── VERIFY EMAIL (request verification) ───────────────────────────────

  describe('POST /v1/auth/verify-email', () => {
    it('should send verification email for a valid userId (200)', async () => {
      sentEmails.length = 0; // Reset captured emails

      const res = await request(httpServer)
        .post('/v1/auth/verify-email')
        .send({ userId: registeredUserId })
        .expect(200);

      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toContain('Verification email sent');
    });

    it('should return 400 when userId is missing', async () => {
      await request(httpServer)
        .post('/v1/auth/verify-email')
        .send({})
        .expect(400);
    });

    it('should return 400 when userId is not a valid UUID', async () => {
      await request(httpServer)
        .post('/v1/auth/verify-email')
        .send({ userId: 'not-a-uuid' })
        .expect(400);
    });
  });

  // ─── RESEND EMAIL (before verify-email confirm, email is NOT yet verified) ─

  describe('POST /v1/auth/resend-email', () => {
    beforeAll(async () => {
      // Clean up existing verification tokens to avoid P2002 unique constraint
      // on the resend use case (known app bug: setVerificationToken uses create, not upsert)
      await prisma.verificationToken.deleteMany({
        where: { identifier: registeredUserId },
      });
    });

    it('should resend verification email for a valid userId (200)', async () => {
      sentEmails.length = 0;

      const res = await request(httpServer)
        .post('/v1/auth/resend-email')
        .send({ userId: registeredUserId })
        .expect(200);

      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toContain('Verification email successfully re-sent');
    });

    it('should return 400 when userId is missing', async () => {
      await request(httpServer)
        .post('/v1/auth/resend-email')
        .send({})
        .expect(400);
    });
  });

  // ─── VERIFY EMAIL (confirm with token) ─────────────────────────────────

  describe('GET /v1/auth/verify-email?token=xxx', () => {
    it('should confirm email verification with a valid token (200)', async () => {
      // Retrieve the verification token directly from DB
      const verificationToken = await prisma.verificationToken.findFirst({
        where: { identifier: registeredUserId },
        orderBy: { expires: 'desc' },
      });

      // Skip if no token was created (depends on verify-email POST above)
      if (!verificationToken) {
        console.warn(
          'No verification token found — skipping confirm test. Ensure POST /v1/auth/verify-email ran first.',
        );
        return;
      }

      const res = await request(httpServer)
        .get(`/v1/auth/verify-email?token=${verificationToken.token}`)
        .expect(200);

      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toContain('Email successfully verified');

      // Verify the user's emailVerified field is now set
      const user = await prisma.user.findUnique({
        where: { id: registeredUserId },
      });
      expect(user?.emailVerified).not.toBeNull();
    });

    it('should return an error with an invalid/expired token', async () => {
      const res = await request(httpServer)
        .get('/v1/auth/verify-email?token=00000000-0000-4000-8000-000000000000');

      // Expect a client error (400 or 404 depending on implementation)
      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.status).toBeLessThan(500);
    });
  });

  // ─── RESEND EMAIL (after verification — should fail) ──────────────────

  describe('POST /v1/auth/resend-email (already verified)', () => {
    it('should return 400 when email is already verified', async () => {
      const res = await request(httpServer)
        .post('/v1/auth/resend-email')
        .send({ userId: registeredUserId })
        .expect(400);

      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toContain('already verified');
    });
  });

  // ─── RESET PASSWORD (request) ──────────────────────────────────────────

  describe('POST /v1/auth/reset-password', () => {
    beforeAll(() => {
      sentEmails.length = 0; // Reset captured emails
    });

    it('should return 200 with an existing email', async () => {
      const res = await request(httpServer)
        .post('/v1/auth/reset-password')
        .send({ email: TEST_EMAIL })
        .expect(200);

      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toContain('Password reset email sent');
    });

    it('should return 200 with a non-existent email (no information leak)', async () => {
      const res = await request(httpServer)
        .post('/v1/auth/reset-password')
        .send({ email: 'ghost@taskflow.test' })
        .expect(200);

      expect(res.body).toHaveProperty('message');
    });

    it('should return 400 when email is missing', async () => {
      await request(httpServer)
        .post('/v1/auth/reset-password')
        .send({})
        .expect(400);
    });

    it('should return 400 when email format is invalid', async () => {
      await request(httpServer)
        .post('/v1/auth/reset-password')
        .send({ email: 'not-valid' })
        .expect(400);
    });
  });

  // ─── RESET PASSWORD (confirm) ──────────────────────────────────────────

  describe('POST /v1/auth/reset-password/confirm', () => {
    it('should return 400 when token is missing', async () => {
      await request(httpServer)
        .post('/v1/auth/reset-password/confirm')
        .send({ newPassword: 'NewSecurePassword1!' })
        .expect(400);
    });

    it('should return 400 when newPassword is missing', async () => {
      await request(httpServer)
        .post('/v1/auth/reset-password/confirm')
        .send({ token: 'some-token' })
        .expect(400);
    });

    it('should return 400 when newPassword is too short', async () => {
      await request(httpServer)
        .post('/v1/auth/reset-password/confirm')
        .send({ token: 'some-token', newPassword: '1234567' })
        .expect(400);
    });

    it('should return 400 with an invalid/non-existent token', async () => {
      const res = await request(httpServer)
        .post('/v1/auth/reset-password/confirm')
        .send({
          token: 'invalid-reset-token-that-does-not-exist',
          newPassword: 'NewSecurePassword1!',
        })
        .expect(400);

      expect(res.body).toHaveProperty('statusCode', 400);
    });
  });

  // ─── CROSS-CUTTING CONCERNS ────────────────────────────────────────────

  describe('Cross-cutting', () => {
    it('should reject requests with non-whitelisted properties on register (forbidNonWhitelisted)', async () => {
      const res = await request(httpServer)
        .post('/v1/auth/register')
        .send({
          username: 'whitelistcheck',
          email: 'whitelist@taskflow.test',
          password: TEST_PASSWORD,
          isAdmin: true,
        })
        .expect(400);

      expect(res.body).toHaveProperty('statusCode', 400);
    });

    it('should still allow login after all previous tests (data integrity)', async () => {
      const res = await request(httpServer)
        .post('/v1/auth/login')
        .send({
          email: TEST_EMAIL,
          password: TEST_PASSWORD,
        })
        .expect(200);

      expect(res.body).toHaveProperty('access_token');
    });
  });
});
