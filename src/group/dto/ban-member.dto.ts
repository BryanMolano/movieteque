import { IsUUID } from "class-validator";

export class BanMemberDto
{
  @IsUUID()
  id: string;
}
