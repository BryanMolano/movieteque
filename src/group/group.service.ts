import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { InjectRepository} from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group, GroupType } from './entities/group.entity';
import { PaginationDto } from './dto/pagination.dto';
import { User } from 'src/user/entities/user.entity';
import { Member} from 'src/member/entities/member.entity';
import { MemberService } from 'src/member/member.service';
import { JwtPayloadInvitationLink } from './interfaces/jwt-payload-invitation-link/jwt-payload-invitation-link.interface';
import { JwtService } from '@nestjs/jwt';
import { JoinByLinkDto } from './dto/join-by-link.dto';
import { ValidRoles } from 'src/auth/interfaces/valid-roles.interface';
import { BanMemberDto } from './dto/ban-member.dto';
import { ChangeMemberRoleDto } from './dto/change-member-role.dto';
import { FileService } from 'src/file/file.service';
import { ChangeMemberNicknameDto } from './dto/change-member-nickname.dto';

// Este servicio tiene un problema de optimizacion, el guard member-role.guard ya verifica que el usaurio sea parte
// del grupo enviado por id en los params de cada método necesario en el contorlador, pero acá en algunos metodos
// se está volviendo a llamar, entonces lo optimo sería quitar la verificacióń acá, pero me da pereza, pongo esto por si acaso.
//
//
//hay 2 find one porque uno se usa como confirmación en muchas de las funciónes de este servicio y otro ser usa para tener 
//todsa las relaciones del grupo, para unificarlas hay que hacer una query muy especifica y no vale la pena
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
    private readonly fileService: FileService
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
      const query = this.groupRepository.createQueryBuilder('group')
        .take(limit)
        .skip(offset)
        .innerJoin('group.members', 'memberFilter')
        .where('memberFilter.user_id = :userId', {userId:user.id})
        .andWhere('memberFilter.isBanned = :isBanned', {isBanned: false})
        .addSelect((subQuery)=>
        {
          return subQuery
            .select('Count(m.id)', 'count')
            .from(Member, 'm')
            .where('m.group_id = group.id')
        }, 'membersCount')
      const {entities, raw} = await query.getRawAndEntities()
      return entities.map((group, i)=>
      {
        (group as any).membersCount = Number(raw[i].membersCount);
        const day = String(group.created_at.getDate()).padStart(2,'0');
        const month = String(group.created_at.getMonth()+1).padStart(2, '0');
        const year = String(group.created_at.getFullYear());
        (group as any).created_at = `${day}/${month}/${year}`;
        return group;
      })
      // const groups = await this.groupRepository.find({
      //   take:limit,
      //   skip:offset,
      //   where:{
      //     members:{
      //       isBanned: false,
      //       user:{
      //         id:user.id
      //       }
      //     } 
      //   }
      // })
      // return groups;
    }
    catch(error)
    {
      this.handleDBExceptions(error);
    }
    
  }

  async findOneComplete(id: string, user: User) 
  {
    try
    {
      const group = await this.groupRepository.findOne({
        where:{
          id: id,
          members:{
            isBanned: false,
          }
        },
        relations:{
          members: {
            user:true,
          },
          recommendations:{
            movie:true,
            user:true,
          }
        }
      })
      if(!group)
      {
        throw new ForbiddenException('user is not in the group or is banned')
      }
      return group
    }
    catch(error)
    {
      this.handleDBExceptions(error)
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
        },
      })
      if(!group)
      {
        throw new ForbiddenException('user is not in the group or is banned')
      }
      return group
    }
    catch(error)
    {
      this.handleDBExceptions(error)
    }
  }

  async findOneForJwt(id: string) 
  {
    try
    {
      const group = await this.groupRepository.findOne({
        where:{
          id: id,
        },
      })
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
    const updatedGroup = await this.groupRepository.preload({id: id, ...updateGroupDto});
    if(!updatedGroup) throw new NotFoundException('group not found')
    await this.groupRepository.save(updatedGroup);
    return updatedGroup;
  }
  async remove(id: string, user: User) 
  {
    const group = await this.findOne(id, user)
    if(group?.imgUrl)
    {
      try
      {
        const urlParsed = new URL(group.imgUrl)
        let urlPathname = urlParsed.pathname
        urlPathname = urlPathname.substring(1)
        await this.fileService.deleteProfileImage(urlPathname)
      }
      catch(error)
      {
        this.logger.warn(`the image of the group ${group.id} could not be removed from s3: ${error}`)
      }
    }
    await this.groupRepository.delete(id)
    return "group eliminated"
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
      const AlreadyAMember= await this.memberRepository.findOne({
        where:{
          user:{
            id:user.id
          },
          group:{
            id:id
          }
        }
      });
      if(AlreadyAMember) 
        throw new BadRequestException(`you are already part of ${group.name}`)
      // throw new BadRequestException('you are already part of this group')
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
          id,
          group:{
            id:groupId
          }
        },
        relations: ['user']
      });
      if(!memberToban) throw new NotFoundException('user not found')
      if(memberToban.user.id === admin.id) throw new ForbiddenException('you cannot ban yourself')
      memberToban.isBanned = true;
      await this.memberRepository.save(memberToban)
      return memberToban;
    }
    catch(error)
    {
      this.handleDBExceptions(error)
    }
  }

  async changeMemberRole(groupId: string, changeMemberRole: ChangeMemberRoleDto, admin: User)
  {
    try
    {
      
      await this.findOne(groupId, admin);
      const {id, role}=changeMemberRole;
      const memberToChangeRol= await this.memberRepository.findOne({
        where:{
          id,
          group:{
            id:groupId
          }
        },
        relations: ['user']
      });
      if(!memberToChangeRol) throw new NotFoundException('member not found')
      if(memberToChangeRol.user.id === admin.id) throw new ForbiddenException('for an admin to change rol, another admin has to do the change')
      memberToChangeRol.role= role;
      await this.memberRepository.save(memberToChangeRol);
      return memberToChangeRol;
      
    }
    catch(error)
    {
      this.handleDBExceptions(error)
    }
  }

  async changeMemberNickname(groupId: string, changeMemberNicknameDto: ChangeMemberNicknameDto,user: User)
  {
    try
    {
      await this.findOne(groupId, user);
      const {nickname}=changeMemberNicknameDto;
      const memberToChangeNickname= await this.memberRepository.findOne({
        where:{
          user:{
            id: user.id
          },
          group:{
            id:groupId
          }
        },
        relations: ['user']
      });
      if(!memberToChangeNickname) throw new NotFoundException('member not found')
      memberToChangeNickname.nickname= nickname;
      await this.memberRepository.save(memberToChangeNickname);
      return memberToChangeNickname;
    }
    catch(error)
    {
      this.handleDBExceptions(error)
    }
  }

  async verifyInvitationToken(jwt: string)
  {
    try
    {
      const payload: JwtPayloadInvitationLink = this.jwtService.verify(jwt)
      const {id, username, nickname} = payload;
      const group = await this.findOneForJwt(id);
      if (!group) throw new NotFoundException('the group no longer exists')
      return{
        groupId: group.id,
        groupName: group.name,
        inviterUsername: username,
        inviterNickname: nickname || username
      }
    }
    catch(error)
    {
      console.log(error);
      throw new UnauthorizedException('the links is invalid or expired, the availability of the link is usually 2 hours since the person who send it ti you copied it.')
    }
  }
  async findPublicGroupsUser(id: string)
  {
    try
    {
      return await this.groupRepository.createQueryBuilder('group')
        .innerJoin('group.members', 'filterMember', 'filterMember.user.id = :id', { id })
        .where('group.type = :type',{type: GroupType.PUBLIC} )
        .leftJoinAndSelect('group.members', 'members')
        .leftJoinAndSelect('members.user', 'users')
        .getMany()
    }
    catch(error)
    {
      console.log(error)
      throw new InternalServerErrorException('my bad chat')
    }

  }
  async joinPublicGroup(id:string, user:User)
  {
    try
    {
      const group = await this.groupRepository.findOneBy({id});
      if(!group) throw new NotFoundException('the group does not exist')
      const AlreadyAMember= await this.memberRepository.findOne({
        where:{
          user:{
            id:user.id
          },
          group:{
            id:id
          }
        }
      });
      if(AlreadyAMember) 
        throw new BadRequestException(`you are already part of ${group.name}`)
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

}
