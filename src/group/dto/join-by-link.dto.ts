import {IsNotEmpty, IsString } from "class-validator";

export class JoinByLinkDto
{
  @IsString()
  @IsNotEmpty()
  jwt: string;
}
