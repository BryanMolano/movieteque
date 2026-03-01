import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';
import { JwtPayloadInvitationLink } from '../interfaces/jwt-payload-invitation-link/jwt-payload-invitation-link.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy)
{

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    configService: ConfigService,
  )
  {
    super({
      secretOrKey: configService.get('JWT_SECRET') || 'secretKey',
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: JwtPayloadInvitationLinkj): Promise<>
  {
    // const { id, username, nickname} = payload;
    // const user = await this.userRepository.findOneBy({ id});
    // if (!user)
    // {
    //   throw new UnauthorizedException('token not valid');
    // }
    // return user;
  }
}


