import { IsString, IsOptional, IsEnum, IsInt, IsDateString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus } from '@/contexts/shared/lib/types';

export class CreateSubTaskDto {
  @ApiProperty({
    description: 'Título de la subtarea.',
    example: 'Implementar funcionalidad de login',
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'Descripción opcional de la subtarea.',
    example: 'Implementar y probar la funcionalidad de login utilizando JWT.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Estado de la subtarea.',
    enum: ['OPEN', 'IN_PROGRESS', 'COMPLETED'], // Especifica las opciones posibles
    example: 'OPEN',
  })
  @IsOptional()
  status?: TaskStatus;

  @ApiPropertyOptional({
    description: 'Prioridad de la subtarea (valor entero).',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  priority?: number;

  @ApiPropertyOptional({
    description: 'Fecha límite de la subtarea en formato ISO 8601.',
    example: '2025-01-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  due_at?: Date;

  @ApiPropertyOptional({
    description: 'UUID del usuario asignado a la subtarea.',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  assignedTo?: string;
}
