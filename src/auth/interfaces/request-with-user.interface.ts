import { User } from "src/user/entities/user.entity";
import { Request } from "express"
import { Member } from "src/member/entities/member.entity";

export interface RequestWithUser extends Request{
  user: User,
  member?: Member,
}
