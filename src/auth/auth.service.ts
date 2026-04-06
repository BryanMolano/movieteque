import { BadRequestException, Injectable, InternalServerErrorException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {User} from '../user/entities/user.entity'
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { LoginUserDto } from 'src/user/dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { ForgotPasswordDto } from 'src/user/dto/forgot-password.dto';
import { MailService } from 'src/mail/mail.service';
import { ResetPasswordDto } from 'src/user/dto/reset-password.dto';
@Injectable()
export class AuthService 
{
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  )
  {
  }
  

  async create(createUserDto: CreateUserDto)
  {
    try
    {
      const userWithEmail= await this.userRepository.findOneBy({email: createUserDto.email});
      if(userWithEmail) throw new BadRequestException('an account with this email already exists');
      const{password, ...userData} = createUserDto;
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });
      await this.userRepository.save(user);
      return {
        ...user,
        token:this.getJwtToken({id:user.id}),
      }
    }
    catch(error)
    {
      this.handleDBErrors(error)
    }
  } 
  
  async login(loginUserDto: LoginUserDto)
  {
    const {password, email}=loginUserDto;
    const user = await this.userRepository.findOne({
      where: {email},
      select: {email:true, password: true, id: true}
    });

    if(!user)
    {
      throw new BadRequestException('credentials are not valid(email)');
    }

    if(!bcrypt.compareSync(password, user.password))
    {
      throw new BadRequestException('credentials are not valid(password)');
    }
    return{
      ...user,
      token:this.getJwtToken({id:user.id}),
    }
  }

  checkAuthStatus(user:User)
  {
    return{
      ...user,
      token: this.getJwtToken({id: user.id})
    }
  }

  getJwtToken(payload: JwtPayload)
  {
    const token = this.jwtService.sign(payload);
    return token;
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto)
  {
    try 
    {
      const userWithEmail = await this.userRepository.findOneBy({
        email: forgotPasswordDto.email,
      })
      if(!userWithEmail) throw new BadRequestException('there is no account with this email');
      const resetToken = crypto.randomInt(100000, 999999).toString();
      const hashedToken= bcrypt.hashSync(resetToken, 10);
      userWithEmail.resetPasswordToken= hashedToken;
      await this.userRepository.save(userWithEmail);
      // await this.mailService.sendPlainTextEmail(
      //   userWithEmail.email,
      //   `MOVIETEQUE - Temporal password recuperation token for user ${userWithEmail.username}`,
      //   `Your recuperation token is: ${resetToken}`
      // )
      await this.mailService.sendHtmlEmail(
        userWithEmail.email,
        'Movieteque - password recuperation token',
        ' RECUPERACION DE CLAVE',
        `
          <p>Hola <b>${userWithEmail.username}</b>,</p>
          <p>Tu código de seguridad para resetear tu clave:</p>
          
          <div style="background-color: #0B2833; color: #CBD3D6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; border: 2px solid #617B85; box-shadow: 4px 4px 0px #595149; margin: 25px 0;">
            ${resetToken}
          </div>
          
          <p>Si no solicitaste esto, puedes ignorar este mensaje.</p>
        ` 
      )
    }
    catch (error) 
    {
      this.handleDBErrors(error);
    }
  }
  async resetPassword(resetPasswordDto: ResetPasswordDto)
  {
    try 
    {
      const {email, newPassword, resetToken}= resetPasswordDto;
      const user= await this.userRepository.findOneBy({
        email: email,
      })
      if(!user) throw new BadRequestException('there is no account with this email');
      if(!user.resetPasswordToken) throw new BadRequestException('there is no password reset request for this account');
      if(!bcrypt.compareSync( resetToken, user.resetPasswordToken))
      {
        throw new BadRequestException('the recuperation token is incorrect');
      }
      user.password= bcrypt.hashSync(newPassword, 10);
      user.resetPasswordToken= null;
      await this.userRepository.save(user);
    }
    catch (error) 
    {
      this.handleDBErrors(error);
    }
  }

  handleDBErrors(error)
  {
    if(error instanceof BadRequestException) throw error
    console.log(error);
    throw new InternalServerErrorException('please check logs');
  }
}
