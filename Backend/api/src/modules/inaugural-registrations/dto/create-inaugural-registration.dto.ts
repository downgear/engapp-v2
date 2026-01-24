import { IsString, IsEmail, IsBoolean, IsOptional } from 'class-validator';

export class CreateInauguralRegistrationDto {
  @IsString()
  parent_name: string;

  @IsString()
  phone: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  primary_goal?: string;

  @IsBoolean()
  wants_to_signup: boolean;

  @IsOptional()
  @IsString()
  interest_reason?: string;

  @IsOptional()
  @IsString()
  rejection_reason?: string;
}


