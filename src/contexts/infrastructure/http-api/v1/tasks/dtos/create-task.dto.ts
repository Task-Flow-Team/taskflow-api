import { TaskStatus } from '@/contexts/shared/lib/types';
import { IsString, IsOptional, IsEnum, IsInt, IsDateString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({
    description: 'UUID del espacio de trabajo al que pertenece la tarea.',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  workspace_id: string;

  @ApiProperty({
    description: 'Título de la tarea.',
    example: 'Desarrollar API de autenticación',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Descripción detallada de la tarea.',
    example: 'Implementar el flujo de autenticación utilizando JWT en NestJS.',
  })
  @IsString()
  description: string;

  @ApiPropertyOptional({
    description: 'Estado de la tarea. Puede ser "OPEN", "IN_PROGRESS" o "COMPLETED".',
    enum: ['OPEN', 'IN_PROGRESS', 'COMPLETED'],
    example: 'OPEN',
  })
  @IsOptional()
  status: TaskStatus;

  @ApiPropertyOptional({
    description: 'Prioridad de la tarea. Valor numérico que indica la importancia.',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  priority: number;

  @ApiPropertyOptional({
    description: 'Fecha límite de la tarea en formato ISO 8601.',
    example: '2025-01-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  due_date: Date;

  @ApiPropertyOptional({
    description: 'UUID del usuario asignado a la tarea.',
    example: '550e8400-e29b-41d4-a716-446655440222',
  })
  @IsOptional()
  @IsUUID()
  assignedTo: string;
}
