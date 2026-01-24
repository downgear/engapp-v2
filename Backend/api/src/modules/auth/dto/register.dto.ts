import { IsEmail, IsString, IsNotEmpty, MinLength, IsOptional, IsEnum } from 'class-validator';
import { UserRole, TeacherType } from '../../../entities';

export class RegisterDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  fullName: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsEnum(UserRole, { message: 'Role phải là student, parent hoặc teacher' })
  role: UserRole;

  // Student-specific fields
  @IsOptional()
  @IsString()
  grade?: string;

  @IsOptional()
  @IsString()
  cefrLevel?: string;

  // Teacher-specific fields
  @IsOptional()
  @IsEnum(TeacherType)
  teacherType?: TeacherType;

  @IsOptional()
  @IsString()
  bio?: string;
}

