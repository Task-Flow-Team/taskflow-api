import { Controller, Get, Post, Put, Delete, Body, Param, HttpStatus, HttpCode } from '@nestjs/common';
import { API_VERSION } from '@/contexts/infrastructure/http-api/v1/route.constants';
import { CreateCommentDto, UpdateCommentDto } from './dtos';
import * as CommentUseCases from '@/contexts/application/usecases/comments';
import { User as UserDecorator } from '@/contexts/shared/lib/decorators';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Comments')
@ApiBearerAuth()
@Controller(`${API_VERSION}/tasks/:taskId/comments`)
export class CommentController {
  constructor(
    private readonly createCommentUseCase: CommentUseCases.CreateCommentUseCase,
    private readonly updateCommentUseCase: CommentUseCases.UpdateCommentUseCase,
    private readonly deleteCommentUseCase: CommentUseCases.DeleteCommentUseCase,
    private readonly getCommentsByTaskUseCase: CommentUseCases.GetCommentsByTaskUseCase,
    private readonly getCommentByIdUseCase: CommentUseCases.GetCommentByIdUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createComment(
    @UserDecorator('userId') userId: string,
    @Param('taskId') taskId: string,
    @Body() dto: CreateCommentDto,
  ) {
    const comment = await this.createCommentUseCase.run(userId, taskId, dto.content);
    return { message: 'Comment created successfully', comment };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getCommentsByTask(@Param('taskId') taskId: string) {
    return await this.getCommentsByTaskUseCase.run(taskId);
  }

  @Get(':commentId')
  @HttpCode(HttpStatus.OK)
  async getCommentById(@Param('commentId') commentId: string) {
    return await this.getCommentByIdUseCase.run(commentId);
  }

  @Put(':commentId')
  @HttpCode(HttpStatus.OK)
  async updateComment(
    @Param('commentId') commentId: string,
    @Body() dto: UpdateCommentDto,
  ) {
    const comment = await this.updateCommentUseCase.run(commentId, dto.content);
    return { message: 'Comment updated successfully', comment };
  }

  @Delete(':commentId')
  @HttpCode(HttpStatus.OK)
  async deleteComment(@Param('commentId') commentId: string) {
    await this.deleteCommentUseCase.run(commentId);
    return { message: 'Comment deleted successfully' };
  }
}
