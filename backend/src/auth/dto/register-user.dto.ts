import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterUserDto {
  @IsString()
  @MinLength(2)
  @MaxLength(32)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(4)
  @MaxLength(32)
  password!: string;
}
