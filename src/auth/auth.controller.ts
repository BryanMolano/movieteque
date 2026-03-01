import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { LoginUserDto } from 'src/user/dto/login-user.dto';

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
  @Post('register')
  login(@Body() loginUserDto: LoginUserDto)
  {
    return this.authService.login(loginUserDto)
  }

}
