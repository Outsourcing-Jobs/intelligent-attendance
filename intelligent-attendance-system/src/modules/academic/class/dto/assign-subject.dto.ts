import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class AssignSubjectDto {
  @ApiProperty({ example: '60f7a1b2c3d4e5f6a7b8c9d0', description: 'ID môn học cần gán vào lớp' })
  @IsMongoId()
  @IsNotEmpty()
  subjectId: string;
}
