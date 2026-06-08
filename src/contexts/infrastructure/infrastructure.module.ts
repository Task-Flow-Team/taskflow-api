import { Module } from '@nestjs/common';

import { ApplicationModule } from '@/contexts/application/application.module';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/contexts/shared/prisma/prisma.service';
import { WorkspaceController, AuthController, UserController, TaskController, SubTaskController, TagController, CommentController } from './http-api/v1';

@Module({
  imports: [ApplicationModule],
  controllers: [AuthController, UserController, WorkspaceController, TaskController, SubTaskController, TagController, CommentController],
  providers: [
    JwtService,
    PrismaService,
  ],
  exports: [JwtService],
})
export class InfrastructureModule {}