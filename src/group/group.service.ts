import { ForbiddenException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { InjectRepository} from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from './entities/group.entity';
import { PaginationDto } from './dto/pagination.dto';
import { User } from 'src/user/entities/user.entity';
import { Member } from 'src/member/entities/member.entity';
import { MemberService } from 'src/member/member.service';
import { JwtPayloadInvitationLink } from './interfaces/jwt-payload-invitation-link/jwt-payload-invitation-link.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class GroupService 
{
  private readonly logger = new Logger('GroupService');
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository : Repository<Group>,
    @InjectRepository(Member)
    private readonly memberRepository : Repository<Member>,
    private readonly memberService: MemberService,
    private readonly jwtService: JwtService,
  )
  {

  }

  async create(createGroupDto: CreateGroupDto) 
  {
    try
    {
      const group = this.groupRepository.create({
        ...createGroupDto
      })
      await this.groupRepository.save(group)
      return group;
    }
    catch(error)
    {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto, user: User) 
  {
    try
    {
      const {limit = 10, offset = 0} = paginationDto;
      const groups = await this.groupRepository.find({
        take:limit,
        skip:offset,
        where:{
          members:{
            isBanned: false,
            user:{
              id:user.id
            }
          } 
        }
      })
      return groups;
    }
    catch(error)
    {
      this.handleDBExceptions(error);
    }
    
  }

  async findOne(id: string, user: User) 
  {
    try
    {
      const group = await this.groupRepository.findOne({
        where:{
          id: id,
          members:{
            isBanned: false,
            user:{
              id:user.id
            }
          }
        }
      })
      if(!group)
      {
        throw new ForbiddenException('user is not in the group')
      }
      return group
    }
    catch(error)
    {
      this.handleDBExceptions(error)

    }
  }

  async getMembers(id:string, user:User)
  {
    try
    {
      await this.findOne(id, user)

      const members = await this.memberRepository.find({
        where:{
          isBanned:false,
          group:{
            id: id,
          }
        }
      })
      return members;
    }
    catch(error)
    {
      this.handleDBExceptions(error)
    }
  }
  async update(id: string, updateGroupDto: UpdateGroupDto, user: User) 
  {
    await this.findOne(id, user); 
    const updatedGroup = await this.groupRepository.update(id, updateGroupDto);
    return updatedGroup;
  }

  async remove(id: string, user: User) 
  {
    await this.findOne(id, user)
    await this.groupRepository.delete(id)
    return "group elimiated"
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
  async getInvitationLink(id: string, user: User)
  {
    const group = await this.findOne(id, user)
    const member = await this.memberService.verifyMember(user, id)
    return this.getJwtToken({id:group!.id, username:user.username, nickname: member.nickname})
  }
  getJwtToken(payload: JwtPayloadInvitationLink)
  {
    const token = this.jwtService.sign(payload);
    return token;
  }
}
