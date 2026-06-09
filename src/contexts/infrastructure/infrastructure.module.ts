import { Module } from '@nestjs/common';

import { ApplicationModule } from '@/contexts/application/application.module';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/contexts/shared/prisma/prisma.service';
import { WorkspaceController, AuthController, UserController, TaskController, SubTaskController, TagController, CommentController } from './http-api/v1';
import { NotificationsController } from './http-api/v1/notifications';
import { AnalyticsController } from './http-api/v1/analytics/Analytics.controller';
import { RemindersController } from './http-api/v1/reminders/Reminders.controller';
import { ReminderCronJob } from './cron/ReminderCronJob';
import { HealthController } from './http-api/v1/health/Health.controller';

@Module({
  imports: [ApplicationModule],
  controllers: [AuthController, UserController, WorkspaceController, TaskController, SubTaskController, TagController, CommentController, NotificationsController, AnalyticsController, RemindersController, HealthController],
  providers: [
    JwtService,
    PrismaService,
    ReminderCronJob,
  ],
  exports: [JwtService],
})
export class InfrastructureModule {}