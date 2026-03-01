import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { LoginUserDto } from 'src/user/dto/login-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/user/entities/user.entity';
import { GetUser } from './decorators/get-user.decorator';

@Controller('auth')
export class AuthController 
{

  constructor(private readonly authService: AuthService)
  {
  }

  @Post('register')
  create(@Body() createUserDto: CreateUserDto)
  {
    return this.authService.create(createUserDto)
  }
  @Post('login')
  login(@Body() loginUserDto: LoginUserDto)
  {
    return this.authService.login(loginUserDto)
  }

  @Get('testtoken')
  @UseGuards(AuthGuard())
  testtoken(@GetUser() user:User)
  {
    return{
      ok:true,
      user,
    }
  }
}
