
import * as authUseCases from '@/contexts/application/usecases/auth';
import * as workspaceUseCases from '@/contexts/application/usecases/workspaces';
import * as userUseCases from '@/contexts/application/usecases/users';
import * as subTaskUseCases from '@/contexts/application/usecases/subtasks';
import * as tagsUseCases from '@/contexts/application/usecases/tags';
import * as tasksUseCases from '@/contexts/application/usecases/tasks';
import * as commentUseCases from '@/contexts/application/usecases/comments';
import * as notificationUseCases from '@/contexts/application/usecases/notifications';
import * as analyticsUseCases from '@/contexts/application/usecases/analytics';
import * as reminderUseCases from '@/contexts/application/usecases/reminders';
import * as groupUseCases from '@/contexts/application/usecases/groups';
import * as timeEntryUseCases from '@/contexts/application/usecases/timeEntries';
import * as repositories from '@/contexts/infrastructure/repositories';
import * as services from '@/contexts/infrastructure/services';

import { JwtStrategy, LocalStrategy } from '@/contexts/shared/lib/strategy';
import { PrismaService } from '@/contexts/shared/prisma/prisma.service';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';
import { CacheModule } from '@nestjs/cache-manager';
import { PassportModule } from '@nestjs/passport';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '6h' },
      }),
      inject: [ConfigService],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          url: configService.get('REDIS_URL')
        }),
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],

  //
  providers: [

    // Add the use cases to the providers array because otherwise they can't be exported.
    ...Object.values(authUseCases),
    ...Object.values(userUseCases),
    ...Object.values(workspaceUseCases),
    ...Object.values(tasksUseCases),
    ...Object.values(subTaskUseCases),
    ...Object.values(tagsUseCases),
    ...Object.values(commentUseCases),
    ...Object.values(notificationUseCases),
    ...Object.values(analyticsUseCases),
    ...Object.values(reminderUseCases),
    ...Object.values(groupUseCases),
    ...Object.values(timeEntryUseCases),

    // Add all strategies and services for the use in use-cases
    PrismaService,
    JwtStrategy,
    LocalStrategy,

    // Add the repositories and services to the providers array for the injection in the use-cases
    {
      provide: 'userRepository',
      useClass: repositories.PrismaUserRepository,
    },
    {
      provide: 'authService',
      useClass: services.AuthService,
    },
    {
      provide: 'workspaceRepository',
      useClass: repositories.PrismaWorkspaceRepository,
    },
    {
      provide: 'subTaskRepository',
      useClass: repositories.PrismaSubTaskRepository,
    },
    {
      provide: 'tagRepository',
      useClass: repositories.PrismaTagRepository,
    },
    {
      provide: 'taskRepository',
      useClass: repositories.PrismaTaskRepository,
    },
    {
      provide: 'activityLogRepository',
      useClass: repositories.PrismaActivityLogRepository,
    },
    {
      provide: 'commentRepository',
      useClass: repositories.PrismaCommentRepository,
    },
    {
      provide: 'notificationRepository',
      useClass: repositories.PrismaNotificationRepository,
    },
    {
      provide: 'analyticsRepository',
      useClass: repositories.PrismaAnalyticsRepository,
    },
    {
      provide: 'reminderRepository',
      useClass: repositories.PrismaReminderRepository,
    },
    {
      provide: 'taskGroupRepository',
      useClass: repositories.PrismaTaskGroupRepository,
    },
    {
      provide: 'timeEntryRepository',
      useClass: repositories.PrismaTimeEntryRepository,
    },
    {
      provide: 'mailService',
      useClass: services.ResendMailService,
    },

    // Add the ConfigService for the use in the use-cases
    {
      provide: 'configService',
      useClass: ConfigService,
    },
  ],

  // Export the use cases from the application module for the use in the infrastructure module
  exports: [
    'reminderRepository',
    'notificationRepository',
    ...Object.values(authUseCases),
    ...Object.values(userUseCases),
    ...Object.values(workspaceUseCases),
    ...Object.values(tasksUseCases),
    ...Object.values(subTaskUseCases),
    ...Object.values(tagsUseCases),
    ...Object.values(commentUseCases),
    ...Object.values(notificationUseCases),
    ...Object.values(analyticsUseCases),
    ...Object.values(reminderUseCases),
    ...Object.values(groupUseCases),
    ...Object.values(timeEntryUseCases),
  ],

})
export class ApplicationModule {}
