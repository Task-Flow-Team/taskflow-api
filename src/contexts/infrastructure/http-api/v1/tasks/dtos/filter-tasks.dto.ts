import { IsOptional, IsString, IsInt, IsUUID, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterTasksDto {
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsInt() @Type(() => Number) priority?: number;
  @IsOptional() @IsUUID() assignedTo?: string;
  @IsOptional() @IsDateString() dueDateBefore?: string;
  @IsOptional() @IsDateString() dueDateAfter?: string;
  @IsOptional() @IsInt() @Type(() => Number) limit?: number;
  @IsOptional() @IsString() cursor?: string;
}
