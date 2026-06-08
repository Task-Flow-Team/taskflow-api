import { Inject, Injectable } from '@nestjs/common';
import { NotificationRepository } from '@/contexts/domain/repositories/notification.repository.port';
import { Notification } from '@/contexts/domain/models/notification.entity';

@Injectable()
export class GetUserNotificationsUseCase {
  constructor(
    @Inject('notificationRepository') private notificationRepository: NotificationRepository,
  ) {}

  async run(userId: string): Promise<Notification[]> {
    return await this.notificationRepository.findByUser(userId);
  }
}
