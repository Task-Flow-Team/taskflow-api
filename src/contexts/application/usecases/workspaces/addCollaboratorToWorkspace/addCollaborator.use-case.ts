import { WorkspaceCollaborator } from "@/contexts/domain/models";
import { WorkspaceRepository } from "@/contexts/domain/repositories";
import { ActivityLogRepository } from "@/contexts/domain/repositories/activityLog.repository.port";
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class AddCollaboratorUseCase {

    constructor(
        @Inject('workspaceRepository') private workspaceRepository: WorkspaceRepository,
        @Inject('activityLogRepository') private activityLogRepository: ActivityLogRepository,
    ) {}

    async run(workspaceId: string, userId: string, addedByUserId?: string): Promise<WorkspaceCollaborator> {
        const collaborator = await this.workspaceRepository.addCollaboratorToWorkspace(workspaceId, userId);

        // Log the activity
        const actorId = addedByUserId ?? userId;
        void this.activityLogRepository.logActivity(actorId, workspaceId, 'collaborator:added');

        return collaborator;
    }
}
