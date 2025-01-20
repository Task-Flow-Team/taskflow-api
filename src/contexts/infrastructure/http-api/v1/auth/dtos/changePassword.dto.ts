import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Contraseña actual del usuario. Debe tener al menos 8 caracteres.',
    example: 'ContraseñaActual123!',
  })
  @IsString()
  @MinLength(8, { message: 'La contraseña actual debe tener al menos 8 caracteres.' })
  oldPassword: string;

  @ApiProperty({
    description: 'Nueva contraseña del usuario. Debe tener al menos 8 caracteres.',
    example: 'NuevaContraseña123!',
  })
  @IsString()
  @MinLength(8, { message: 'La nueva contraseña debe tener al menos 8 caracteres.' })
  newPassword: string;
}
