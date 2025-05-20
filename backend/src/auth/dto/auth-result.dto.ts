import { IsString, MinLength } from 'class-validator';

export class AuthResultDto {
  @IsString()
  @MinLength(10)
  accessToken!: string;
}
