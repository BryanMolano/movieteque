import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {User} from '../user/entities/user.entity'
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from 'src/user/dto/login-user.dto';
@Injectable()
export class AuthService 
{
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  )
  {
  }
  
  handleDBErrors(error)
  {
    console.log(error);
    throw new InternalServerErrorException('please check logs');
  }
  async create(createUserDto: CreateUserDto)
  {
    try
    {
      const{password, ...userData} = createUserDto;
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });
      await this.userRepository.save(user);
      return {
        ...user,
        //TODO: token:this.getjwttoken({id:user.id}),
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
      throw new UnauthorizedException('credentials are not valid(email)');
    }

    if(!bcrypt.compareSync(password, user.password))
    {
      throw new UnauthorizedException('credentials are not valid(password)');
    }
    return{
      ...user,
      //TODO: token:this.getjwttoken({id:user.id}),
    }
  }
  //TODO: checkAuthStatus
  //TODO: getJwtToken 
}
