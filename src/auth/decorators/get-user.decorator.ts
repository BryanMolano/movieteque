import { createParamDecorator, ExecutionContext, InternalServerErrorException } from '@nestjs/common';
import { RequestWithUser } from '../interfaces/request-with-user.interface';
import { User } from 'src/user/entities/user.entity';

export const GetUser = createParamDecorator(
  (data: keyof User | undefined, ctx: ExecutionContext) =>
  {


    const req:RequestWithUser = ctx.switchToHttp().getRequest();
    const user:User = req.user;
    if (!user)
    {
      throw new InternalServerErrorException('user not found (request)');
    }
    return (!data) ? user : user[data];
  },
);
