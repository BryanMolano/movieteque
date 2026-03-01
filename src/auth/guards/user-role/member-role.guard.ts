import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { META_ROLES } from '../../decorators/role-protected.decorator';
import { RequestWithUser } from 'src/auth/interfaces/request-with-user.interface';
import { Member } from 'src/member/entities/member.entity';

@Injectable()
export class MemberRoleGuard implements CanActivate
{
  constructor(
    private readonly reflector: Reflector,
  )
  {
  }
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean>
  {
    const validRoles: string[] = this.reflector.get(META_ROLES, context.getHandler());
    if (!validRoles) return true;
    if(validRoles.length === 0) return true;
    const req:RequestWithUser = context.switchToHttp().getRequest();
    const member:Member= req.member!;
    if (!member)
    {
      throw new BadRequestException('user not found');
    }
    if (validRoles.includes(member.role))
    {
      return true;
    }
    throw new ForbiddenException(`User ${member.nickname} needs a valid role: [${validRoles.join()}]`);
  }
}

