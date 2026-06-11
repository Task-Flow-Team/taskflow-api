import { IsUUID, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGroupDto {
  @ApiProperty({ description: 'UUID of the workspace' })
  @IsUUID()
  workspace_id: string;

  @ApiProperty({ description: 'Name of the group' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({ description: 'Color of the group' })
  @IsString()
  color: string;
}
