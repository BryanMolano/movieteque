import { ForbiddenException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Recommendation } from 'src/recommendation/entities/recommendation.entity';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateInteractionDto } from './dto/create-interaction.dto';
import { UpdateInteractionDto } from './dto/update-interaction.dto';
import { Interaction } from './entities/interaction.entity';
import { Member } from 'src/member/entities/member.entity';

@Injectable()
export class InteractionService 
{
  private readonly logger = new Logger('InteractionService');
  constructor(

    @InjectRepository(Recommendation)
    private readonly recommendationRepository: Repository<Recommendation>,
    @InjectRepository(Interaction)
    private readonly interactionRepository: Repository<Interaction>,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>
  ) 
  {}
  async create(createInteractionDto: CreateInteractionDto, groupId:string, user:User) 
  {
    try 
    {
      const {response, rating, memberId, recommendationId, state, type} = createInteractionDto;
      const recommendation = await this.recommendationRepository.findOne({where:
        {id: recommendationId, group:{id: groupId}
        }
      })
      if(!recommendation) throw new ForbiddenException('Recommendation not found in this group');

      const member = await this.memberRepository.findOne({
        where:{
          id: memberId, 
          group:
            {id: groupId}, 
          user:
            {id: user.id}
        }
      })
      if(!member) throw new ForbiddenException('Member not found in this group for this user');

      const interaction = this.interactionRepository.create({
        response,
        rating,
        state,
        type,
        member,
        recommendation
      })
      await this.interactionRepository.save(interaction);
      return interaction;
    }
    catch (error) 
    {
      this.handleDBExceptions(error);
    }
  }

  findAll() 
  {
    return `This action returns all interaction`;
  }

  findOne(id: number) 
  {
    return `This action returns a #${id} interaction`;
  }

  update(id: number, updateInteractionDto: UpdateInteractionDto) 
  {
    return `This action updates a #${id} interaction`;
  }

  remove(id: number) 
  {
    return `This action removes a #${id} interaction`;
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
}
