import { IsUUID, IsInt, Min, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddManualEntryDto {
  @ApiProperty({ description: 'UUID of the task' })
  @IsUUID()
  task_id: string;

  @ApiProperty({ description: 'Duration in seconds' })
  @IsInt()
  @Min(1)
  duration: number;

  @ApiPropertyOptional({ description: 'Optional description' })
  @IsOptional()
  @IsString()
  description?: string;
}
