import { IsString, IsEmail, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterRequestDto {
  @ApiProperty({
    description: 'Nombre de usuario, debe tener al menos 3 caracteres.',
    example: 'john_doe',
  })
  @IsString()
  @MinLength(3, { message: 'El nombre de usuario debe tener al menos 3 caracteres.' })
  username: string;

  @ApiProperty({
    description: 'Email válido del usuario.',
    example: 'usuario@ejemplo.com',
  })
  @IsEmail({}, { message: 'Debe proporcionar un email válido.' })
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario, debe tener al menos 8 caracteres.',
    example: 'Password123!',
  })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  password: string;

  @ApiPropertyOptional({
    description: 'Nombre completo del usuario.',
    example: 'Juan Pérez',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Preferencia de idioma del usuario.',
    example: 'es',
  })
  @IsOptional()
  @IsString()
  language_preference?: string;

  @ApiPropertyOptional({
    description: 'Zona horaria preferida del usuario.',
    example: 'America/Managua',
  })
  @IsOptional()
  @IsString()
  timezone?: string;
}
