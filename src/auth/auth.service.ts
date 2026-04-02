import { BadRequestException, Injectable, InternalServerErrorException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {User} from '../user/entities/user.entity'
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from 'src/user/dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
@Injectable()
export class AuthService 
{
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  )
  {
  }
  
  handleDBErrors(error)
  {
    if(error instanceof BadRequestException) throw error
    console.log(error);
    throw new InternalServerErrorException('please check logs');
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
}
