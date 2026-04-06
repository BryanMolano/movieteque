import { IsNotEmpty, IsString, MaxLength } from "class-validator";
export class VerificationEmailDto
{
  @IsString()
  @IsNotEmpty()
  @MaxLength(6)
  verificationCode: string;
}
