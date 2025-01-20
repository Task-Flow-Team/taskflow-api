import { IsString, IsEmail, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordRequestDto {
  @ApiProperty({
    description: 'Email del usuario que solicita el restablecimiento de contraseña.',
    example: 'usuario@ejemplo.com',
  })
  @IsEmail({}, { message: 'Debe proporcionar un email válido.' })
  email: string;
}

export class ResetPasswordConfirmDto {
  @ApiProperty({
    description: 'Token recibido para confirmar el restablecimiento de contraseña.',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  token: string;

  @ApiProperty({
    description: 'Nueva contraseña del usuario, debe tener al menos 8 caracteres.',
    example: 'NuevaContraseña123!',
  })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  newPassword: string;
}
