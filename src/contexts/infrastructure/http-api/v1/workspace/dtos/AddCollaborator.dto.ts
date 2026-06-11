import { IsUUID, IsOptional, IsEmail } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AddCollaboratorDto {
  @ApiPropertyOptional({
    description: 'UUID of the user to add as collaborator.',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Email of the user to add as collaborator (alternative to userId).',
    example: 'user@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;
}
