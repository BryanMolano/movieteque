import { IsUUID } from "class-validator";

export class InviteMemberDto 
{
  @IsUUID()
  id: string;
}

