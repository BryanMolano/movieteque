import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
// import { UserService } from 'src/user/user.service';
import { RequestWithUser } from 'src/auth/interfaces/request-with-user.interface';
import { User } from 'src/user/entities/user.entity';
import { MemberService } from 'src/member/member.service';
import { Member } from 'src/member/entities/member.entity';

@Injectable()
export class MemberVerificationGuard implements CanActivate 
{
  constructor(
    // private readonly userService: UserService,
    private readonly memberService: MemberService,
  )
  {
  }
  async canActivate(
    context: ExecutionContext,
  ):  Promise<boolean> 
  {
    const req:RequestWithUser= context.switchToHttp().getRequest();
    const user:User= req.user;
    const groupId= String(req.params.groupId);
    const member:Member = await this.memberService.verifyMember(user, groupId);
    req.member = member;
    return true;
  }
}
