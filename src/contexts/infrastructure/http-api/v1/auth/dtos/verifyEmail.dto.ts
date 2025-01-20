import { IsString, MinLength, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailRequestDto {
  @ApiProperty({
    description: 'ID único del usuario en formato UUID.',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsUUID('4', { message: 'El userId debe ser un UUID válido.' })
  @MinLength(36, { message: 'El userId debe tener al menos 36 caracteres.' })
  userId: string;
}
