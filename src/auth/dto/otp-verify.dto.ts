import { IsNotEmpty, IsString } from 'class-validator';

export class LoginAuthDto {
  @IsNotEmpty()
  otpCode: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
