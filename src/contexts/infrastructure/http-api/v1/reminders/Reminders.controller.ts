import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/contexts/shared/lib/guards';
import { User as UserDecorator } from '@/contexts/shared/lib/decorators';
import { API_VERSION } from '@/contexts/infrastructure/http-api/v1/route.constants';
import { CreateReminderUseCase } from '@/contexts/application/usecases/reminders/createReminder/createReminder.use-case';
import { ListRemindersUseCase } from '@/contexts/application/usecases/reminders/listReminders/listReminders.use-case';
import { DeleteReminderUseCase } from '@/contexts/application/usecases/reminders/deleteReminder/deleteReminder.use-case';

import { IsUUID, IsDateString, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReminderDto {
  @ApiProperty({ description: 'UUID of the task' })
  @IsUUID()
  task_id!: string;

  @ApiProperty({ description: 'Reminder date/time in ISO 8601 format' })
  @IsDateString()
  reminder_time!: string;

  @ApiPropertyOptional({ description: 'Type of reminder' })
  @IsOptional()
  @IsString()
  reminder_type?: string;
}

@ApiTags('Reminders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller(`${API_VERSION}/reminders`)
export class RemindersController {
  constructor(
    private createReminderUseCase: CreateReminderUseCase,
    private listRemindersUseCase: ListRemindersUseCase,
    private deleteReminderUseCase: DeleteReminderUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@UserDecorator('id') userId: string, @Body() dto: CreateReminderDto) {
    return this.createReminderUseCase.run(userId, dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async list(@UserDecorator('id') userId: string, @Query('taskId') taskId?: string) {
    return this.listRemindersUseCase.run(userId, taskId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@UserDecorator('id') userId: string, @Param('id') id: string): Promise<void> {
    await this.deleteReminderUseCase.run(id, userId);
  }
}
