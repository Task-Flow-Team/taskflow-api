import { Module } from '@nestjs/common';

import { ApplicationModule } from '@/contexts/application/application.module';
import { JwtService } from '@nestjs/jwt';
import { WorkspaceController, AuthController, UserController, TaskController, SubTaskController, TagController, CommentController } from './http-api/v1';

@Module({
  imports: [ApplicationModule],
  controllers: [AuthController, UserController, WorkspaceController, TaskController, SubTaskController, TagController, CommentController],
  providers: [
    JwtService
  ],
  exports: [JwtService],
})
export class InfrastructureModule {}