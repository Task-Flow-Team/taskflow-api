import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserProfileDto {
  @ApiPropertyOptional({ description: 'Display name', example: 'John Doe' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Username', example: 'johndoe' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({ description: 'Email address', example: 'john@example.com' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: 'Profile picture URL', example: 'https://example.com/pic.jpg' })
  @IsOptional()
  @IsString()
  profile_picture_url?: string;

  @ApiPropertyOptional({ description: 'Banner picture URL', example: 'https://example.com/banner.jpg' })
  @IsOptional()
  @IsString()
  banner_picture_url?: string;
}
