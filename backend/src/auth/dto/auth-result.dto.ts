import { SignInDataDto } from './sign-in-data.dto';
import { IsString, MinLength } from 'class-validator';

export class AuthResultDto extends SignInDataDto {
  @IsString()
  @MinLength(10)
  accessToken!: string;
}
