import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/contexts/shared/prisma/prisma.service';

@Injectable()
export class WorkspaceMemberGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId;

    if (!userId) {
      throw new ForbiddenException('User not authenticated');
    }

    const workspaceId = request.params.workspaceId || request.params.id;

    if (!workspaceId) {
      return true;
    }

    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { user_id: true },
    });

    if (!workspace) {
      throw new ForbiddenException('Workspace not found');
    }

    if (workspace.user_id === userId) {
      return true;
    }

    const collaborator = await this.prisma.workspaceCollaborator.findUnique({
      where: {
        collaborator_id_workspace_id: {
          collaborator_id: userId,
          workspace_id: workspaceId,
        },
      },
    });

    if (collaborator) {
      return true;
    }

    throw new ForbiddenException('You are not a member of this workspace');
  }
}
