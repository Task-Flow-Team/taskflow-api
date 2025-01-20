import { IsString, IsOptional, IsEnum, IsInt, IsDateString, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus } from '@/contexts/shared/lib/types';

export class UpdateSubTaskDto {
  @ApiPropertyOptional({
    description: 'Nuevo título de la subtarea.',
    example: 'Actualizar funcionalidad de login',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Nueva descripción de la subtarea.',
    example: 'Actualizar la implementación de login para incluir validación adicional.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Nuevo estado de la subtarea.',
    enum: ['OPEN', 'IN_PROGRESS', 'COMPLETED'], // Opciones posibles para TaskStatus
    example: 'IN_PROGRESS',
  })
  @IsOptional()
  status?: TaskStatus;

  @ApiPropertyOptional({
    description: 'Nueva prioridad de la subtarea (valor entero).',
    example: 2,
  })
  @IsOptional()
  @IsInt()
  priority?: number;

  @ApiPropertyOptional({
    description: 'Nueva fecha límite de la subtarea en formato ISO 8601.',
    example: '2025-02-15T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  due_at?: Date;

  @ApiPropertyOptional({
    description: 'Nuevo UUID del usuario asignado a la subtarea.',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  assignedTo?: string;
}
