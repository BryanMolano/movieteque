import { ForbiddenException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike,Not,Repository } from 'typeorm';
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
        take: 10
      })
      return users;
    }
    catch(error)
    {
      this.handleDBExceptions(error)
    }
  }

  async findOne(term: string, user: User) 
  {
    try
    {
      const users = await this.userRepository.findOne({
        where:{
          id: Not(user.id),
          username:ILike(`%${term}%`)
        },
      })
      return users;
    }
    catch(error)
    {
      this.handleDBExceptions(error)
    }
  }

  private handleDBExceptions(error) 
  {
    this.logger.error(error);
    if(error instanceof ForbiddenException)
    {
      throw error
    }
    throw new InternalServerErrorException('Unexpected error occurred, check server logs');
  }
  async update(user:User, updateUserDto : UpdateUserDto) 
  {
    try
    {
    // const {description, imgUrl} = UpdateUserDto;
      const updatedUser = await this.userRepository.preload({id: user.id, ...updateUserDto})
      if(!updatedUser) throw new NotFoundException('user not found')
      await this.userRepository.save(updatedUser);
      return updatedUser; 
    }
    catch(error)
    {
      this.handleDBExceptions(error)
    }
  }



}
