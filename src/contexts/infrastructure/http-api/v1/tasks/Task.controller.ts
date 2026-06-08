import { Controller, Get, Post, Patch, Delete, Body, Param, Query, HttpStatus, HttpCode, BadRequestException, UseGuards, ForbiddenException, NotFoundException } from '@nestjs/common';
import { AssignTaskDto, UpdateTaskDto, CreateTaskDto, FilterTasksDto } from '@/contexts/infrastructure/http-api/v1/tasks/dtos';
import { API_VERSION } from '@/contexts/infrastructure/http-api/v1/';
import * as TaskUseCases from '@/contexts/application/usecases/tasks';
import { Roles, User as UserDecorator } from '@/contexts/shared/lib/decorators';
import { JwtAuthGuard, WorkspaceMemberGuard } from '@/contexts/shared/lib/guards';
import { Task } from '@/contexts/domain/models';
import { ApiBearerAuth } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard)
@Controller(`${API_VERSION}/tasks`)
@ApiBearerAuth()
export class TaskController {

  // Implements the neccesaries use cases
  constructor(
    private readonly createTaskUseCase: TaskUseCases.CreateTaskUseCase,
    private readonly deleteTaskUseCase: TaskUseCases.DeleteTaskUseCase,
    private readonly updateTaskUseCase: TaskUseCases.UpdateTaskUseCase,
    private readonly getAllTasksAssignedToUserUseCase: TaskUseCases.GetAllTasksAssignedToUserUseCase,
    private readonly getAllTasksByWorkspaceUseCase: TaskUseCases.GetAllTasksByWorkspaceUseCase,
    private readonly getAllTasksCreatedByUserUseCase: TaskUseCases.GetAllTasksCreatedByUserUseCase,
    private readonly getAllTasksOfUserUseCase: TaskUseCases.GetAllTasksOfUserUseCase,
    private readonly getAllTasksUseCase: TaskUseCases.GetAllTasksUseCase,
    private readonly getTaskByIdUseCase: TaskUseCases.GetTaskByIdUseCase,
    private readonly assignTaskUseCase: TaskUseCases.AssignTaskUseCase,
    private readonly searchTasksUseCase: TaskUseCases.SearchTasksUseCase,
  ) {}

  // Create a new task
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTask(@UserDecorator('userId') userId: string, @Body() taskDto: CreateTaskDto) {
    const task = await this.createTaskUseCase.run(userId, taskDto);
    return {
      message: 'Task created successfully',
      task,
    };
  }

  // Get all tasks assigned to a user (userId from JWT — IDOR fix)
  @Get('assigned-to')
  @HttpCode(HttpStatus.OK)
  async getAllTasksAssignedToUser(@UserDecorator('userId') userId: string): Promise<Task[]> {
    return await this.getAllTasksAssignedToUserUseCase.run(userId);
  }

  // Get all tasks of a workspace with optional filtering and cursor pagination
  @Get('workspace/:workspaceId')
  @UseGuards(WorkspaceMemberGuard)
  @HttpCode(HttpStatus.OK)
  async getAllTasksByWorkspace(
    @Param('workspaceId') workspaceId: string,
    @Query() filters: FilterTasksDto,
  ) {
    return await this.getAllTasksByWorkspaceUseCase.run(workspaceId, filters);
  }

  // Search tasks by title or description in a workspace
  @Get('workspace/:workspaceId/search')
  @UseGuards(WorkspaceMemberGuard)
  @HttpCode(HttpStatus.OK)
  async searchTasks(
    @Param('workspaceId') workspaceId: string,
    @Query('q') q: string = '',
  ): Promise<Task[]> {
    return this.searchTasksUseCase.run(workspaceId, q);
  }

  // Get all tasks created by a user (userId from JWT — IDOR fix)
  @Get('created-by')
  @HttpCode(HttpStatus.OK)
  async getAllTasksCreatedByUser(@UserDecorator('userId') userId: string): Promise<Task[]> {
    return await this.getAllTasksCreatedByUserUseCase.run(userId);
  }

  // Get all tasks of a user (userId from JWT — IDOR fix)
  @Get('of')
  @HttpCode(HttpStatus.OK)
  async getAllTasksOfUser(@UserDecorator('userId') userId: string): Promise<Task[]> {
    return await this.getAllTasksOfUserUseCase.run(userId);
  }

  // Get all tasks in the application
  @Get()
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  async getAllTasks(): Promise<Task[]> {
    return await this.getAllTasksUseCase.run();
  }

  // Get a unique task by Id
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getTaskById(@Param('id') taskId: string): Promise<Task> {
    return await this.getTaskByIdUseCase.run(taskId);
  }

  // Update an existing task
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updateTask(@UserDecorator('userId') userId: string, @Param('id') taskId: string, @Body() taskDto: UpdateTaskDto) {
    const updatedTask = await this.updateTaskUseCase.run(userId, taskId, taskDto);
    return {
      message: 'Task updated successfully',
      task: updatedTask,
    };
  }

  // Assign a task to a workspace member
  @Patch(':id/assign')
  @HttpCode(HttpStatus.OK)
  async assignTask(
    @UserDecorator('userId') userId: string,
    @Param('id') taskId: string,
    @Body() dto: AssignTaskDto,
  ) {
    const task = await this.assignTaskUseCase.run(userId, taskId, dto.userId);
    return { message: 'Task assigned successfully', task };
  }

  // Delete an existing task (ownership check)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteTask(
    @UserDecorator('userId') userId: string,
    @Param('id') taskId: string,
  ) {
    const task = await this.getTaskByIdUseCase.run(taskId);
    if (!task) throw new NotFoundException('Task not found');
    if (task.createdBy !== userId) throw new ForbiddenException('You do not have permission to delete this task');
    await this.deleteTaskUseCase.run(taskId, userId);
    return {
      message: 'Task deleted successfully',
    };
  }
}
