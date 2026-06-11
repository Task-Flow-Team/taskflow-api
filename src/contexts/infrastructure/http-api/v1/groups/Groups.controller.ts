import { Controller, Get, Post, Patch, Delete, Body, Param, HttpStatus, HttpCode, UseGuards } from '@nestjs/common';
import { API_VERSION } from '@/contexts/infrastructure/http-api/v1/';
import * as GroupUseCases from '@/contexts/application/usecases/groups';
import { User as UserDecorator } from '@/contexts/shared/lib/decorators';
import { JwtAuthGuard } from '@/contexts/shared/lib/guards';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateGroupDto } from './dtos/create-group.dto';
import { UpdateGroupDto } from './dtos/update-group.dto';

@ApiTags('Groups')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller(`${API_VERSION}/groups`)
export class GroupsController {
  constructor(
    private readonly createGroupUseCase: GroupUseCases.CreateGroupUseCase,
    private readonly getGroupsByWorkspaceUseCase: GroupUseCases.GetGroupsByWorkspaceUseCase,
    private readonly updateGroupUseCase: GroupUseCases.UpdateGroupUseCase,
    private readonly deleteGroupUseCase: GroupUseCases.DeleteGroupUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createGroup(@UserDecorator('id') userId: string, @Body() dto: CreateGroupDto) {
    const group = await this.createGroupUseCase.run(userId, dto.workspace_id, dto.name, dto.color);
    return {
      message: 'Group created successfully',
      group,
    };
  }

  @Get('workspace/:workspaceId')
  @HttpCode(HttpStatus.OK)
  async getGroupsByWorkspace(@Param('workspaceId') workspaceId: string) {
    return this.getGroupsByWorkspaceUseCase.run(workspaceId);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updateGroup(@UserDecorator('id') userId: string, @Param('id') groupId: string, @Body() dto: UpdateGroupDto) {
    const group = await this.updateGroupUseCase.run(userId, groupId, dto);
    return {
      message: 'Group updated successfully',
      group,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteGroup(@UserDecorator('id') userId: string, @Param('id') groupId: string) {
    await this.deleteGroupUseCase.run(userId, groupId);
    return {
      message: 'Group deleted successfully',
    };
  }
}
