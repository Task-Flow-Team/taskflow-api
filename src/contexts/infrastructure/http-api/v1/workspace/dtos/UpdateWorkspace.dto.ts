import { IsString, IsOptional, IsBoolean, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateWorkspaceDto {
  @ApiPropertyOptional({
    description: 'New name for the workspace. Minimum 5 characters.',
    example: 'Updated Project Name',
  })
  @IsOptional()
  @IsString()
  @MinLength(5)
  name?: string;

  @ApiPropertyOptional({
    description: 'New description for the workspace.',
    example: 'Updated workspace description.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Whether the workspace is archived.',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;
}
