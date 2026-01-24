import { IsNumber, IsString, IsEmail, IsIn } from 'class-validator';

export class CreateConnectionDto {
  @IsNumber()
  studentId: number;

  @IsEmail()
  email: string;

  @IsString()
  @IsIn(['parent', 'teacher'])
  linkType: 'parent' | 'teacher';
}

