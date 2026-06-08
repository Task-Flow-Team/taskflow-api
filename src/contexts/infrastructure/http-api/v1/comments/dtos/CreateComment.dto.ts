import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({
    description: 'Content of the comment.',
    example: 'This task needs more clarification.',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
