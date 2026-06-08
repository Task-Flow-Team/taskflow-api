import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserSettingsDto {
  @ApiPropertyOptional({ description: 'Language preference', example: 'en' })
  @IsOptional()
  @IsString()
  language_preference?: string;

  @ApiPropertyOptional({ description: 'Timezone', example: 'America/Argentina/Buenos_Aires' })
  @IsOptional()
  @IsString()
  timezone?: string;
}
