import { ForbiddenException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { InjectRepository} from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from './entities/group.entity';
import { PaginationDto } from './dto/pagination.dto';
import { User } from 'src/user/entities/user.entity';
import { Member} from 'src/member/entities/member.entity';
import { MemberService } from 'src/member/member.service';
import { JwtPayloadInvitationLink } from './interfaces/jwt-payload-invitation-link/jwt-payload-invitation-link.interface';
import { JwtService } from '@nestjs/jwt';
import { JoinByLinkDto } from './dto/join-by-link.dto';
import { ValidRoles } from 'src/auth/interfaces/valid-roles.interface';
import { BanMemberDto } from './dto/ban-member.dto';

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

  async create(createGroupDto: CreateGroupDto, user: User) 
  {
    try
    {
      const group = this.groupRepository.create({
        ...createGroupDto
      })
      await this.groupRepository.save(group)

      const member = this.memberRepository.create({
        entryDate: new Date,
        group,
        user,
        role:ValidRoles.Admin,
      })
      await this.memberRepository.save(member)

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
    await this.findOne(id, user)
    const member = await this.memberService.verifyMember(user, id)
    return this.getJwtToken({id:id, username:user.username, nickname: member.nickname})
  }

  getJwtToken(payload: JwtPayloadInvitationLink)
  {
    const token = this.jwtService.sign(payload,{
      expiresIn: '1d',
    });
    return token;
  }

  async joinByLink(joinByLinkDto : JoinByLinkDto, user: User)
  {
    try
    {
      const {jwt}=joinByLinkDto;
      const payload:JwtPayloadInvitationLink = this.jwtService.verify(jwt);
      const {id} = payload;
      const group = await this.groupRepository.findOneBy({id});
      if(!group) throw new NotFoundException('the group does not exist')
      const newMember = this.memberRepository.create({
        entryDate: new Date,
        group,
        user,
      });
      await this.memberRepository.save(newMember);
      return newMember;
    }
    catch(error)
    {
      this.handleDBExceptions(error)
    }
  }

  async banMember(groupId: string, banMemberDto: BanMemberDto, admin: User)
  {
    await this.findOne(groupId, admin);
    try
    {
      const {id}=banMemberDto;
      const memberToban= await this.memberRepository.findOne({
        where:{
          id
        },
        relations: ['user']
      });
      if(!memberToban) throw new NotFoundException('user not found')
      if(memberToban.user.id === admin.id) throw new ForbiddenException('you cannot ban yourself')
      memberToban.isBanned = true;
      return memberToban;
    }
    catch(error)
    {
      this.handleDBExceptions(error)
    }
  }
}
