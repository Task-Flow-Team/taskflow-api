import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTagDto {
  @ApiProperty({
    description: 'Nombre de la etiqueta.',
    example: 'Urgente',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Color asociado a la etiqueta en formato hexadecimal.',
    example: '#f84a24',
  })
  @IsString()
  @IsNotEmpty()
  color: string;

  @ApiProperty({
    description: 'ID del espacio de trabajo al que pertenece la etiqueta.',
    example: 'workspace-123',
  })
  @IsString()
  @IsNotEmpty()
  workspace_id: string;
}
