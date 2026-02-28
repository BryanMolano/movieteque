import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { User } from 'src/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from './entities/member.entity';
import { NotFoundError } from 'rxjs';

@Injectable()
export class MemberService 
{
  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,


  )
  {

  }
  create(createMemberDto: CreateMemberDto) 
  {
    return 'This action adds a new member';
  }

  findAll() 
  {
    return `This action returns all member`;
  }

  findOne(id: number) 
  {
    return `This action returns a #${id} member`;
  }

  update(id: number, updateMemberDto: UpdateMemberDto) 
  {
    return `This action updates a #${id} member`;
  }

  remove(id: number) 
  {
    return `This action removes a #${id} member`;
  }
  
  async verifyMember(user: User, groupId:string):Promise<Member>
  {
    const{id}=user
    const member = await this.memberRepository.findOne({
      where:{
        user:{
          id:id
        },
        group:{
          id:groupId
        }
      }
    })
    if(!member)
    {

      throw new ForbiddenException('the user is not part from this group')
    }
    return member;
  }


}
