import { User, AccessToken, RegisterRequestBody, validateUserBody, Mail } from '@/contexts/domain/models/';
import { BadRequestException, Injectable, Inject, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthServicePort } from '@/contexts/domain/services';
import { MailService } from '@/contexts/domain/services';
import { RedisBlacklistUseCase } from '@/contexts/application/usecases/auth';
import { UserRepository } from '@/contexts/domain/repositories';
import { ConfigService } from '@nestjs/config';
import { welcomeTemplate } from '@/contexts/infrastructure/templates';

@Injectable()
export class AuthService implements AuthServicePort {
  constructor(
    @Inject('userRepository') private userRepository: UserRepository,
    @Inject('mailService') private mailService: MailService,
    private jwtService: JwtService,
    private redisBlacklistService: RedisBlacklistUseCase,
    private configService: ConfigService,
  ) {}

  async validateUser(userBody: validateUserBody): Promise<User> {

    // Check if the userBody is provided
    if(!userBody) throw new BadRequestException('User Body is required');

    // Find the user by the provided email
    const user = await this.userRepository.findUniqueByEmail(userBody.email);
    if(!user) throw new UnauthorizedException('Invalid email or password');

    // Check if the password matches the hashed password
    const isMatch: boolean = bcrypt.compareSync(userBody.password, user.password);
    if(!isMatch) throw new UnauthorizedException('Invalid email or password');

    return user;
  }

  async login(user: User): Promise<AccessToken> {
    if (!user || !user.email) {
      throw new BadRequestException('Valid user information is required');
    }

    // Si el ID del usuario no está presente, consultar en la base de datos
    if (!user.id) {
      const userFromDb = await this.userRepository.findByEmail(user.email);
      if (!userFromDb) {
        throw new NotFoundException('User not found');
      }
      user.id = userFromDb.id; // Actualizar el ID en el objeto `user`
    }

    // Crear el payload con el ID y el email del usuario
    const payload = { userId: user.id, email: user.email, roles: user.roles || [] };

    // Generar y retornar el token de acceso
    return { access_token: this.jwtService.sign(payload) };
  }



  async logout(token: string): Promise<{message: string}> {

    // Check if the token is provided
    if(!token) throw new BadRequestException('Token is required');

    // Decode the token and get the expiration time
    const decodedToken = this.jwtService.decode(token);

    // Calculate the expiration time
    const expirationTime = decodedToken.exp - Math.floor(Date.now() / 1000);

    // Add the token to the blacklist and return a success message
    await this.redisBlacklistService.addToBlacklist(token, expirationTime);
    return { message: 'Successfully logged out' };
  }

  async register(userToRegister: RegisterRequestBody): Promise<AccessToken>{

    // Check if the userToRegister is provided
    if(!userToRegister) throw new BadRequestException('User body to register is required');

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(userToRegister.password, 12);

    // Create a new user with the hashed password
    const user = await this.userRepository.createNewUser(userToRegister, hashedPassword);

    // Send welcome email (fire-and-forget)
    const userName = user.name || user.username || 'New User';
    const loginUrl = this.configService.get<string>('APP_URL') || 'http://localhost:4200';
    const welcomeMail: Mail = {
      to: [{ name: userName, email: user.email }],
      from: {
        name: this.configService.get<string>('RESEND_FROM_NAME'),
        email: this.configService.get<string>('RESEND_FROM_EMAIL'),
      },
      subject: 'Welcome to TaskFlow!',
      text: `Welcome to TaskFlow, ${userName}! Your account has been created successfully.`,
      html: welcomeTemplate({ userName, loginUrl }),
    };
    this.mailService.send(welcomeMail).catch(() => {});

    // Login the user and return the access token
    return this.login(user);
  }

  async changePassword(userId: string, lastPassword: string, newPassword: string): Promise<Boolean> {

      // Check if the userId is provided
      if(!userId) throw new BadRequestException('User id is required.');

      // Check if the lastPassword is provided
      if(!lastPassword) throw new BadRequestException('Last password is required.');

      // Check if the newPassword is provided
      if(!newPassword) throw new BadRequestException('New password is required.');

      // Check if the newPassword and the lastPassword are the same, throw an error if they are
      if(lastPassword === newPassword) throw new BadRequestException('New password cannot be the same as the old password.');

      // Check if the user exists
      const user = await this.userRepository.findUniqueById(userId);
      if(!user) throw new NotFoundException(`User with id ${userId} not found.`);

      // Check if the last password provided and the hashed password match
      const isMatch: boolean = await bcrypt.compare(lastPassword, user.password);
      if(!isMatch) throw new BadRequestException('Password does not match.');

      // Hash the new password
      const newHashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = newHashedPassword;

      // Update the user with the new password already hashed
      await this.userRepository.updateUser(userId, user);

      // Return true to indicate that the password was changed successfully
      return true;
  }

  async resetPassword(userId: string, newPassword: string): Promise<Boolean> {

    // Check if the userId is provided
    if(!userId) throw new BadRequestException('User id is required.');

    // Check if the newPassword is provided
    if(!newPassword) throw new BadRequestException('New password is required.');

    // Check if the user exists
    const user = await this.userRepository.findUniqueById(userId);
    if(!user) throw new NotFoundException(`User with id ${userId} not found.`);

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    // Update the user with the new password already hashed
    await this.userRepository.updateUser(userId, user);

    // Return true to indicate that the password was changed successfully
    return true;
  }

}