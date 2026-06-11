import { Workspace } from "@/contexts/domain/models";
import { WorkspaceRepository } from "@/contexts/domain/repositories";
import { ActivityLogRepository } from "@/contexts/domain/repositories/activityLog.repository.port";
import { Inject,Injectable } from "@nestjs/common";

@Injectable()
export class CreateWorkspaceUseCase {

    // This constructor takes a workspaceRepository as a dependency
    constructor(
        @Inject('workspaceRepository') private workspaceRepository: WorkspaceRepository,
        @Inject('activityLogRepository') private activityLogRepository: ActivityLogRepository,
    ){}

    // This function takes a userId, name and description as a parameter and returns an array of Workspaces CREATED by the user provided
    async run(userId: string, name: string, description: string): Promise<Workspace>{

        // Call the repository method to create a new workspace
        const workspace = await this.workspaceRepository.createWorkspace(userId, name, description);

        void this.activityLogRepository.logActivity(userId, workspace.id, 'workspace:created');

        return workspace;

    }
}