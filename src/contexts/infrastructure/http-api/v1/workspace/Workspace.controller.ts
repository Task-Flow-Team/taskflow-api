import { Controller, Get, Post, Patch, Delete, Body, Param, HttpStatus, HttpCode, UseGuards } from '@nestjs/common';
import { CreateWorkspaceDto, UpdateWorkspaceDto, AddCollaboratorDto } from '@/contexts/infrastructure/http-api/v1/workspace/dtos';
import { API_VERSION } from '@/contexts/infrastructure/http-api/v1/';
import * as WorkspaceUseCases from '@/contexts/application/usecases/workspaces';
import { User as UserDecorator, Roles } from '@/contexts/shared/lib/decorators';
import { JwtAuthGuard, WorkspaceMemberGuard } from '@/contexts/shared/lib/guards';
import { Workspace } from '@/contexts/domain/models';
import { ApiBearerAuth } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard)
@Controller(`${API_VERSION}/workspaces`)
@ApiBearerAuth()
export class WorkspaceController {
  
  constructor(
    private readonly createWorkspaceUseCase: WorkspaceUseCases.CreateWorkspaceUseCase,
    private readonly deleteWorkspaceUseCase: WorkspaceUseCases.DeleteWorkspaceUseCase,
    private readonly updateWorkspaceUseCase: WorkspaceUseCases.UpdateWorkspaceUseCase,
    private readonly getAllWorkspacesUseCase: WorkspaceUseCases.GetAllWorkspacesUseCase,
    private readonly getWorkspacesByUserUseCase: WorkspaceUseCases.GetAllWorkspacesCreatedByUserUseCase,
    private readonly getWorkspacesOfUserUseCase: WorkspaceUseCases.GetAllWorkspacesOfUserUseCase,
    private readonly getWorkspacesAsCollaborator: WorkspaceUseCases.GetAllWorkspacesAsCollaborator,
    private readonly getWorkspaceByIdUseCase: WorkspaceUseCases.GetWorkspaceByIdUseCase,
    private readonly addCollaboratorUseCase: WorkspaceUseCases.AddCollaboratorUseCase,
    private readonly getCollaboratorsUseCase: WorkspaceUseCases.GetCollaboratorsUseCase,
    private readonly deleteCollaboratorUseCase: WorkspaceUseCases.DeleteCollaboratorUseCase,
    private readonly getActivityByWorkspaceUseCase: WorkspaceUseCases.GetActivityByWorkspaceUseCase,
  ) {}

  // Create workspace route
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createWorkspace(@UserDecorator('userId') userId: string, @Body() workspaceDto: CreateWorkspaceDto) {
    const workspace = await this.createWorkspaceUseCase.run(userId, workspaceDto.name, workspaceDto.description);
    return {
      message: 'Workspace created successfully',
      workspace,
    };
  }

  // Get all workspaces route
  @Get()
  @Roles("ADMIN")
  @HttpCode(HttpStatus.OK)
  async getAllWorkspaces(): Promise<Workspace[]> {
    return await this.getAllWorkspacesUseCase.run();
  }

  // Get all workspaces of the user (as owner or collaborator)
  @Get('my-workspaces')
  @HttpCode(HttpStatus.OK)
  async getMyWorkspaces(@UserDecorator('userId') userId: string): Promise<Workspace[]> {
    return await this.getWorkspacesOfUserUseCase.run(userId);
  }

  // Get all workspaces of a user as collaborator
  @Get('collaborated-by/:userId')
  @HttpCode(HttpStatus.OK)
  async getWorkspacesCollaboratedByMe(@Param('userId') userId: string): Promise<Workspace[]> {
    return await this.getWorkspacesAsCollaborator.run(userId);
  }

  // Get all workspaces created by a user
  @Get('created-by/:userId')
  @HttpCode(HttpStatus.OK)
  async getWorkspacesCreatedByMe(@Param('userId') userId: string): Promise<Workspace[]> {
    return await this.getWorkspacesByUserUseCase.run(userId);
  }

  // Get an unique workspace by Id
  @Get(':id')
  @UseGuards(WorkspaceMemberGuard)
  @HttpCode(HttpStatus.OK)
  async getWorkspaceById(@Param('id') workspaceId: string): Promise<Workspace> {
    return await this.getWorkspaceByIdUseCase.run(workspaceId);
  }

  // Get activity feed for a workspace
  @Get(':id/activity')
  @UseGuards(WorkspaceMemberGuard)
  @HttpCode(HttpStatus.OK)
  async getWorkspaceActivity(@Param('id') workspaceId: string) {
    return await this.getActivityByWorkspaceUseCase.run(workspaceId);
  }

  // Update an existing workspace
  @Patch(':id')
  @UseGuards(WorkspaceMemberGuard)
  @HttpCode(HttpStatus.OK)
  async updateWorkspace(@Param('id') workspaceId: string, @Body() workspaceDto: UpdateWorkspaceDto) {
    const updatedWorkspace = await this.updateWorkspaceUseCase.run(workspaceId, workspaceDto as any);
    return {
      message: 'Workspace updated successfully',
      workspace: updatedWorkspace,
    };
  }

  // Delete an existing workspace
  @Delete(':id')
  @UseGuards(WorkspaceMemberGuard)
  @HttpCode(HttpStatus.OK)
  async deleteWorkspace(@Param('id') workspaceId: string) {
    await this.deleteWorkspaceUseCase.run(workspaceId);
    return {
      message: 'Workspace deleted successfully',
    };
  }

  // Add a collaborator to a workspace
  @Post(':id/collaborators')
  @UseGuards(WorkspaceMemberGuard)
  @HttpCode(HttpStatus.CREATED)
  async addCollaborator(@Param('id') workspaceId: string, @Body() dto: AddCollaboratorDto) {
    const collaborator = await this.addCollaboratorUseCase.run(workspaceId, dto.userId);
    return {
      message: 'Collaborator added successfully',
      collaborator,
    };
  }

  // Get all collaborators of a workspace
  @Get(':id/collaborators')
  @UseGuards(WorkspaceMemberGuard)
  @HttpCode(HttpStatus.OK)
  async getCollaborators(@Param('id') workspaceId: string) {
    const collaborators = await this.getCollaboratorsUseCase.run(workspaceId);
    return collaborators;
  }

  // Remove a collaborator from a workspace
  @Delete(':id/collaborators/:userId')
  @UseGuards(WorkspaceMemberGuard)
  @HttpCode(HttpStatus.OK)
  async removeCollaborator(@Param('id') workspaceId: string, @Param('userId') userId: string) {
    await this.deleteCollaboratorUseCase.run(workspaceId, userId);
    return {
      message: 'Collaborator removed succesfully',
    };
  }

}