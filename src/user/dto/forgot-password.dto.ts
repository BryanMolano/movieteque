import { IsString, IsEmail } from "class-validator";

export class ForgotPasswordDto
{
  @IsString()
  @IsEmail({}, {message: 'please type a valid email address.'})
  email: string;
}
