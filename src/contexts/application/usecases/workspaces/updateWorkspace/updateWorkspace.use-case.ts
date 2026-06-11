import { Workspace } from "@/contexts/domain/models";
import { WorkspaceRepository } from "@/contexts/domain/repositories";
import { ActivityLogRepository } from "@/contexts/domain/repositories/activityLog.repository.port";
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class UpdateWorkspaceUseCase {

    // This constructor takes a workspaceRepository as a dependency
    constructor(
        @Inject('workspaceRepository') private workspaceRepository: WorkspaceRepository,
        @Inject('activityLogRepository') private activityLogRepository: ActivityLogRepository,
    ){}

    // This function takes a userId, workspaceId as a parameter, a workspace object and returns the workspace already updated
    async run(userId: string, workspaceId: string, workspace: Workspace): Promise<Workspace>{

        // Call the repository method to update a specific workspace
        const updatedWorkspace = await this.workspaceRepository.updateWorkspace(workspaceId, workspace);

        void this.activityLogRepository.logActivity(userId, workspaceId, 'workspace:updated');

        return updatedWorkspace;
    }
}