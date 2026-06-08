import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddCollaboratorDto {
  @ApiProperty({
    description: 'UUID of the user to add as collaborator.',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  userId: string;
}
