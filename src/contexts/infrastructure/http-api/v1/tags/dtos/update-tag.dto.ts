import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTagDto {
  @ApiPropertyOptional({
    description: 'Nuevo nombre de la etiqueta.',
    example: 'Alta Prioridad',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Nuevo color asociado a la etiqueta en formato hexadecimal.',
    example: '#00FF00',
  })
  @IsOptional()
  @IsString()
  color?: string;
}
