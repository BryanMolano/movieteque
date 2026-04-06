import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { LoginUserDto } from 'src/user/dto/login-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/user/entities/user.entity';
import { GetUser } from './decorators/get-user.decorator';
import { ForgotPasswordDto } from 'src/user/dto/forgot-password.dto';
import { ResetPasswordDto } from 'src/user/dto/reset-password.dto';

@Controller('auth')
export class AuthController 
{

  constructor(private readonly authService: AuthService)
  {
  }

  @Get('authUser')
  @UseGuards(AuthGuard())
  authUser(@GetUser() user: User)
  {
    return user;
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
  
  @Post('forgot-password')
  forgotPassword(@Body() forgotPassword: ForgotPasswordDto)
  {
    return this.authService.forgotPassword(forgotPassword)
  }

  @Post('reset-password')
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto)
  {
    return this.authService.resetPassword(resetPasswordDto)
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
