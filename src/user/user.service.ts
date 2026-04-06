import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { ILike, Not, Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { MailService } from 'src/mail/mail.service';
import { VerificationEmailDto } from './dto/verification-email.dto';

@Injectable()
export class UserService 
{
  private readonly logger = new Logger('GroupService');
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly mailService: MailService,
  )
  {
  }

  async findAll(term: string, user:User) 
  {
    try
    {
      const users = await this.userRepository.find({
        where:{
          
          id: Not(user.id),
          username:ILike(`%${term}%`),
        },
        take: 20
      })
      return users;
    }
    catch(error)
    {
      this.handleDBExceptions(error)
    }
  }

  async findOne(term: string) 
  {
    try
    {
      const userfound = await this.userRepository.findOne({
        where:{
          // id: Not(user.id),
          username:ILike(`%${term}%`)
        },
      })
      return userfound;
    }
    catch(error)
    {
      this.handleDBExceptions(error)
    }
  }

  async update(user:User, updateUserDto : UpdateUserDto) 
  {
    try
    {
      if(updateUserDto.username)
      {
        const userWithSameUsername = await this.userRepository.findOne({
          where:{
            username: updateUserDto.username,
            id: Not(user.id) 
          }
        })
        if(userWithSameUsername) throw new BadRequestException('username already exists')
      }
      if(updateUserDto.oldPassword && updateUserDto.newPassword)
      {
        const newPasswordEncrypted = bcrypt.hashSync(updateUserDto.newPassword, 10);

        const userWithPassword = await this.userRepository.findOne({
          where: {id:user.id},
          select:['id', 'password', 'username', 'description', 'imgUrl']
        });
        if(!userWithPassword) throw new NotFoundException('user not found')
        if(!bcrypt.compareSync(updateUserDto.oldPassword, userWithPassword?.password)) throw new BadRequestException('the old password is not correct')

        else
        {
          const updatedUser = await this.userRepository.preload({id: user.id, 
            password: newPasswordEncrypted, 
            description: updateUserDto.description, 
            username: updateUserDto.username,
            imgUrl: updateUserDto.imgUrl,
          })
          if(!updatedUser) throw new NotFoundException('user not found')
          await this.userRepository.save(updatedUser);
          return updatedUser; 
        }
      }
      const updatedUser = await this.userRepository.preload({id: user.id, 
        description: updateUserDto.description, 
        username: updateUserDto.username,
        imgUrl: updateUserDto.imgUrl,
      })
      if(!updatedUser) throw new NotFoundException('user not found')
      await this.userRepository.save(updatedUser);
      return updatedUser; 
    }
    catch(error)
    {
      if(error instanceof BadRequestException || error instanceof NotFoundException)
        throw error;
      this.handleDBExceptions(error)
    }
  }

  async findOneId(id: string) 
  {
    try
    {
      const userfound = await this.userRepository.findOne({
        where:{
          id: id
        },
      })
      return userfound;
    }
    catch(error)
    {
      this.handleDBExceptions(error)
    }
  }

  private handleDBExceptions(error) 
  {
    if(error instanceof BadRequestException) throw error
    if(error instanceof ForbiddenException) throw error
    throw new InternalServerErrorException('Unexpected error occurred, check server logs');
  }


  async sendVerificationEmail(user: User)
  {
    try 
    {
      const verificationCode= crypto.randomInt(100000, 999999).toString();
      const hashedToken= bcrypt.hashSync(verificationCode, 10);
      user.verificationCode= hashedToken;
      await this.userRepository.save(user);
      // await this.mailService.sendPlainTextEmail(
      //   user.email,
      //   `MOVIETEQUE - Email verification code for: ${user.username}`,
      //   `Your verification code is: ${verificationCode}`
      // )
      // await this.mailService.sendHtmlEmail(
      //   user.email,
      //   'Movieteque - password recuperation token',
      //   ' PASSWORD RECUPERATION',
      //   `
      //     <p>Hola <b>${user.username}</b>,</p>
      //     <p>Tu código de seguridad para verificar tu cuenta:</p>
      //     <div style="background-color: #222; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; border: 1px solid #555; margin: 20px 0;">
      //       ${verificationCode}
      //     </div>
      //     <p>Si no solicitaste esto, puedes ignorar este mensaje.</p>
      //   ` 
      // )
      await this.mailService.sendHtmlEmail(
        user.email,
        'Movieteque - codigo de verificacion',
        'CODIGO DE VERIFICACION',
        `
          <p>Hola <b>${user.username}</b>,</p>
          <p>Tu código de seguridad para verificar tu cuenta es:</p>
          
          <div style="background-color: #0B2833; color: #CBD3D6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; border: 2px solid #617B85; box-shadow: 4px 4px 0px #595149; margin: 25px 0;">
            ${verificationCode}
          </div>
          
          <p>Si no solicitaste esto, puedes ignorar este mensaje.</p>
        ` 
      )
    }
    catch (error) 
    {
      this.handleDBExceptions(error);
    }
  }
  async verificationEmail(verificationEmailDto: VerificationEmailDto, user: User)
  {
    try 
    {
      const {verificationCode}= verificationEmailDto;
      if(!user) throw new BadRequestException('there is no user');
      if(!user.verificationCode) throw new BadRequestException('there is no verification code for this user');
      if(!bcrypt.compareSync( verificationCode, user.verificationCode))
      {
        throw new BadRequestException('the verification code is incorrect');
      }
      user.isEmailVerified = true;
      user.verificationCode= null;
      await this.userRepository.save(user);
      return user;
    }
    catch (error) 
    {
      this.handleDBExceptions(error);
    }
  }

  async activateDesactivateNotifications ( user: User )
  {
    try 
    {
      const userFound = await this.userRepository.findOne({
        where:{id: user.id}
      })
      if(!userFound) throw new BadRequestException('there is no user');
      userFound.isNotificationEnable= !userFound.isNotificationEnable;
      await this.userRepository.save(userFound);
      return user;
    }
    catch (error) 
    {
      this.handleDBExceptions(error);
    }
  }
}
