import { createParamDecorator, ExecutionContext, InternalServerErrorException } from '@nestjs/common';
import { RequestWithUser } from '../interfaces/request-with-user.interface';
import { Member } from 'src/member/entities/member.entity';

export const GetMember= createParamDecorator(
  (data: keyof Member| undefined, ctx: ExecutionContext) =>
  {


    const req:RequestWithUser = ctx.switchToHttp().getRequest();
    const member:Member= req.member!;
    if (!member)
    {
      throw new InternalServerErrorException('member not found (request)');
    }
    return (!data) ? member: member[data];
  },
);

