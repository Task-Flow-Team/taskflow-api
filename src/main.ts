import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app/app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // Verificar JWT_SECRET
  const jwtSecret = configService.get<string>('JWT_SECRET');
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not set in the environment variables');
  }

  // Configurar Redis
  const redisUrl = new URL(configService.get<string>('REDIS_URL'));
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: {
      host: redisUrl.hostname,
      port: parseInt(redisUrl.port),
      password: redisUrl.password,
      username: redisUrl.username,
      retryAttempts: 5,
      retryDelay: 3000,
    },
  });

  // Integrar Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Taskflow API')
    .setDescription('API documentation for Taskflow application')
    .setVersion('1.0')
    .addBearerAuth() // Agregar soporte para JWT
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document); // Documentación en /api/docs

  // Iniciar microservicios y aplicación
  await app.startAllMicroservices();
  await app.listen(3000);

  console.log(`Application is running on: http://localhost:3000`);
  console.log(`Swagger documentation is available at: http://localhost:3000/api/docs`);
}

bootstrap();
