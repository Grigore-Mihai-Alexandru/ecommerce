import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class AuthInputDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(4)
  @MaxLength(32)
  password!: string;
}
