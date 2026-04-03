import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { ILike, Not, Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService 
{
  private readonly logger = new Logger('GroupService');
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
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
}
