import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StartTimerDto {
  @ApiProperty({ description: 'UUID of the task to start timer for' })
  @IsUUID()
  task_id: string;
}
