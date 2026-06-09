import { InfrastructureModule } from '@/contexts/infrastructure/infrastructure.module';
import { ApplicationModule } from '@/contexts/application/application.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { HttpExceptionFilter } from '@/contexts/shared/lib/filters/http-exception.filter';
import { JwtAuthGuard } from '@/contexts/shared/lib/guards';
import { PrismaUserRepository } from '@/contexts/infrastructure/repositories/';
import { PrismaService } from '@/contexts/shared/prisma/prisma.service';
import { JwtStrategy } from '@/contexts/shared/lib/strategy/jwt.strategy';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }]),
    ScheduleModule.forRoot(),
    ApplicationModule,
    InfrastructureModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    JwtService,
    PrismaService,
    {
      provide: 'userRepository',
      useClass: PrismaUserRepository,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    JwtStrategy,
  ],
  exports: [JwtService],
})
export class AppModule {}
