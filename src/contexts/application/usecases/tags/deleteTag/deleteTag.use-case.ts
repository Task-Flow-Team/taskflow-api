import { Inject, Injectable } from '@nestjs/common';
import { TagRepository } from '@/contexts/domain/repositories';
import { ActivityLogRepository } from '@/contexts/domain/repositories/activityLog.repository.port';

@Injectable()
export class DeleteTagUseCase {

  // This constructor takes a tagRepository as a dependency
  constructor(
    @Inject('tagRepository') private tagRepository: TagRepository,
    @Inject('activityLogRepository') private activityLogRepository: ActivityLogRepository,
  ) {}

  // This function takes a userId and tagId as parameters and returns a successfully message
  async run(userId: string, tagId: string): Promise<{message: string}> {

    // Get the tag first to find the workspace_id
    const tag = await this.tagRepository.getTagById(tagId);

    // Call the repository method to delete a tag
    await this.tagRepository.deleteTag(tagId);

    if (tag?.workspace_id) {
      void this.activityLogRepository.logActivity(userId, tag.workspace_id, 'tag:deleted');
    }

    // Return a successfully message
    return {message: "Successfully Deleted Tag"}

  }
}