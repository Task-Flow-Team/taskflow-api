import { IsOptional, IsString, IsInt } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateGroupDto {
  @ApiPropertyOptional({ description: 'New name of the group' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'New color of the group' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ description: 'New position of the group' })
  @IsOptional()
  @IsInt()
  position?: number;
}
