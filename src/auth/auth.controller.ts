import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController 
{

  constructor(private readonly authService: AuthService)
  {
  }

  @Get('private')
  @UseGuards(AuthGuard())
  testingPrivateRoute(
    @Req() request: Express.Request,
    @GetUser() user: User,
    @GetUser('email') userEmail: string,
    @RawHeaders() rawHeaders: string[],
  )
  {
    console.log(request);
    return {
      ok: true,
      message: 'ola mundo priavte',
      user,
      userEmail,
      rawHeaders,
    };
  }


  // @SetMetadata('roles', ['admin', 'super-user'])

 }


  @Get('private3')
  @Auth(ValidRoles.admin)
  privateRout3(
    @GetUser() user: User,
  )
  {
    return {
      ok: true,
      user,
    };
  }
}
