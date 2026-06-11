import { WorkspaceCollaborator } from "@/contexts/domain/models";
import { WorkspaceRepository } from "@/contexts/domain/repositories";
import { ActivityLogRepository } from "@/contexts/domain/repositories/activityLog.repository.port";
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class DeleteCollaboratorUseCase {

    // This constructor takes a workspaceRepository as a dependency
    constructor(
        @Inject('workspaceRepository') private workspaceRepository: WorkspaceRepository,
        @Inject('activityLogRepository') private activityLogRepository: ActivityLogRepository,
    ){}

    // This function takes a workspaceId, userId to remove, and requesterId as parameters and returns the workspaceCollaborator object removed
    async run(workspaceId: string, userId: string, requesterId: string): Promise<WorkspaceCollaborator>{

        // Call the repository method to remove the collaborator from the workspace
        const result = await this.workspaceRepository.removeCollaboratorFromWorkspace(workspaceId, userId);

        void this.activityLogRepository.logActivity(requesterId, workspaceId, 'collaborator:removed');

        return result;
    }
}