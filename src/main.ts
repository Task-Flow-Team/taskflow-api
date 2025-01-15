import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app/app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  
  const app = await NestFactory.create(AppModule);
  
  const configService = app.get(ConfigService);
  
  const jwtSecret = configService.get<string>('JWT_SECRET');
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not set in the environment variables');
  }
  
  const redisUrl = new URL(configService.get('REDIS_URL'));

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: {
      host: redisUrl.hostname,
      port: parseInt(redisUrl.port),
      password: redisUrl.password,
      username: redisUrl.username,
      retryAttempts: 5,
      retryDelay: 3000
    }
  });

  await app.startAllMicroservices();
  await app.listen(3000);

}

bootstrap();