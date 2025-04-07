import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class SignInDataDto {
  @IsString()
  @MinLength(2)
  @MaxLength(32)
  name!: string;

  @IsEmail()
  email!: string;
}