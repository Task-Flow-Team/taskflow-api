import { Inject, Injectable } from '@nestjs/common';
import { TagRepository } from '@/contexts/domain/repositories/';
import { ActivityLogRepository } from '@/contexts/domain/repositories/activityLog.repository.port';
import { Tag } from '@/contexts/domain/models';

@Injectable()
export class CreateTagUseCase {

  // This constructor takes a tagRepository as a dependency
  constructor(
    @Inject('tagRepository') private tagRepository: TagRepository,
    @Inject('activityLogRepository') private activityLogRepository: ActivityLogRepository,
  ) {}

  // This function takes a workspaceId, userId, and a Tag object with name and color as a parameter after returns the tag object
  async run(workspaceId: string, userId: string, tag: Partial<Tag>): Promise<Tag> {

    // Call the repository method to create a tag and get the all object already created
    const createdTag = await this.tagRepository.createNewTag(workspaceId, userId, tag.name, tag.color);

    void this.activityLogRepository.logActivity(userId, workspaceId, 'tag:created');

    return createdTag;

  }
}