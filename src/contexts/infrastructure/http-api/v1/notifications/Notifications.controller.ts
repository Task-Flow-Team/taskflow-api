import {
  Controller,
  Get,
  Patch,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/contexts/shared/lib/guards';
import { User as UserDecorator } from '@/contexts/shared/lib/decorators';
import { GetUserNotificationsUseCase, MarkNotificationAsReadUseCase } from '@/contexts/application/usecases/notifications';
import { API_VERSION } from '@/contexts/infrastructure/http-api/v1/route.constants';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller(`${API_VERSION}/notifications`)
export class NotificationsController {
  constructor(
    private readonly getUserNotificationsUseCase: GetUserNotificationsUseCase,
    private readonly markNotificationAsReadUseCase: MarkNotificationAsReadUseCase,
  ) {}

  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getMyNotifications(@UserDecorator('userId') userId: string) {
    return await this.getUserNotificationsUseCase.run(userId);
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  async markAsRead(@Param('id') notificationId: string) {
    const notification = await this.markNotificationAsReadUseCase.run(notificationId);
    return { message: 'Notification marked as read', notification };
  }
}
