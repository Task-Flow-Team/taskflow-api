import { Controller, Get, Post, Patch, Delete, Body, Param, HttpStatus, HttpCode, UseGuards } from '@nestjs/common';
import { API_VERSION } from '@/contexts/infrastructure/http-api/v1/';
import * as TimeEntryUseCases from '@/contexts/application/usecases/timeEntries';
import { User as UserDecorator } from '@/contexts/shared/lib/decorators';
import { JwtAuthGuard } from '@/contexts/shared/lib/guards';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { StartTimerDto } from './dtos/start-timer.dto';
import { AddManualEntryDto } from './dtos/add-manual-entry.dto';

@ApiTags('Time Entries')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller(`${API_VERSION}/time-entries`)
export class TimeEntriesController {
  constructor(
    private readonly startTimerUseCase: TimeEntryUseCases.StartTimerUseCase,
    private readonly stopTimerUseCase: TimeEntryUseCases.StopTimerUseCase,
    private readonly getTimeEntriesByTaskUseCase: TimeEntryUseCases.GetTimeEntriesByTaskUseCase,
    private readonly deleteTimeEntryUseCase: TimeEntryUseCases.DeleteTimeEntryUseCase,
    private readonly addManualEntryUseCase: TimeEntryUseCases.AddManualEntryUseCase,
  ) {}

  @Post('start')
  @HttpCode(HttpStatus.CREATED)
  async startTimer(@UserDecorator('id') userId: string, @Body() dto: StartTimerDto) {
    const entry = await this.startTimerUseCase.run(userId, dto.task_id);
    return {
      message: 'Timer started',
      entry,
    };
  }

  @Patch(':id/stop')
  @HttpCode(HttpStatus.OK)
  async stopTimer(@UserDecorator('id') userId: string, @Param('id') entryId: string) {
    const entry = await this.stopTimerUseCase.run(userId, entryId);
    return {
      message: 'Timer stopped',
      entry,
    };
  }

  @Get('task/:taskId')
  @HttpCode(HttpStatus.OK)
  async getTimeEntriesByTask(@Param('taskId') taskId: string) {
    return this.getTimeEntriesByTaskUseCase.run(taskId);
  }

  @Post('manual')
  @HttpCode(HttpStatus.CREATED)
  async addManualEntry(@UserDecorator('id') userId: string, @Body() dto: AddManualEntryDto) {
    const entry = await this.addManualEntryUseCase.run(userId, dto.task_id, dto.duration, dto.description);
    return {
      message: 'Time entry added',
      entry,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteTimeEntry(@UserDecorator('id') userId: string, @Param('id') entryId: string) {
    await this.deleteTimeEntryUseCase.run(userId, entryId);
    return {
      message: 'Time entry deleted',
    };
  }
}
