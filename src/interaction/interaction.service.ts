import { ForbiddenException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Recommendation } from 'src/recommendation/entities/recommendation.entity';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateInteractionDto } from './dto/create-interaction.dto';
import { UpdateInteractionDto } from './dto/update-interaction.dto';
import { Interaction} from './entities/interaction.entity';
import { Member } from 'src/member/entities/member.entity';
import { RecommendationState } from 'src/recommendation/interfaces/recommendation-state';
import { group } from 'console';
import { MailService } from 'src/mail/mail.service';

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
    private readonly memberRepository: Repository<Member>,
    private readonly mailService: MailService,
  ) 
  {}
  async create(createInteractionDto: CreateInteractionDto, groupId:string, user:User) 
  {
    // this.logger.log(`trying to create interaction: ${createInteractionDto.type} for recommendation ${createInteractionDto.recommendationId} by user ${user.id} in group ${groupId}`);
    try 
    {
      const {response, rating, memberId, recommendationId, state, type} = createInteractionDto;
      const recommendation = await this.recommendationRepository.findOne({where:
        {id: recommendationId, group:{id: groupId}, 
        }, relations: {user: true, group:true, movie:true}
      })
      if(!recommendation) throw new ForbiddenException('Recommendation not found in this group');
      if(recommendation.recommendationState === RecommendationState.Inactive) throw new ForbiddenException('Cannot interact with an inactive recommendation');

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

      const maxInteractionInDB= await this.interactionRepository.findOne({
        where:{
          member: {id: memberId},
          recommendation: {id: recommendationId},
          type: type
        },
        order:{
          number: 'DESC'
        }
      })
      // const maxInteractionInDBPrivate = await this.interactionRepository.findOne({
      //   where:{
      //     member: {id: memberId},
      //     recommendation: {id: recommendationId},
      //     type: InteractionType.PRIVATE
      //   },
      //   order:{
      //     number: 'DESC'
      //   }
      // })

      const nextOrNewNumber= (maxInteractionInDB?.number || 0) + 1   

      const interaction = this.interactionRepository.create({
        response,
        rating,
        member,
        recommendation,
        state,
        type,
        number: nextOrNewNumber

      })
      await this.interactionRepository.save(interaction);


      const shouldNotify = recommendation.user.isEmailVerified && 
                           recommendation.user.isNotificationEnable && 
                           recommendation.user.id !== user.id;

      if(shouldNotify)
      {
        const recommendationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/recommendation/${recommendation.id}`;

        void this.mailService.sendHtmlEmail(
          recommendation.user.email,
          `Movieteque - Nueva interacción en tu recomendación de ${recommendation.movie.name}`,
          'NUEVA INTERACCIÓN',
          `
            <p>Hola <b>${recommendation.user.username}</b>,</p>
            <p><b>${user.username}</b> acaba de interactuar con tu recomendación en el grupo <b>${recommendation.group.name}</b>:</p>
            
            <div style="background-color: #0B2833; color: #CBD3D6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; border: 2px solid #617B85; box-shadow: 4px 4px 0px #595149; margin: 25px 0;">
              ${recommendation.movie.name}
            </div>

            <div style="text-align: center; margin-top: 35px; margin-bottom: 10px;">
                <a href="${recommendationLink}" style="display: inline-block; background-color: #CBD3D6; color: #0B2833; text-decoration: none; font-weight: 900; font-family: monospace; font-size: 16px; padding: 12px 24px; border: 2px solid #CBD3D6; box-shadow: 4px 4px 0px #988775; letter-spacing: -0.5px;">
                  [ VER INTERACCIÓN ]
                </a>
            </div>

            <p style="font-size: 12px; color: #617B85;">Si prefieres no recibir notificaciones, puedes desactivarlas en tu perfil de MOVIETEQUE.</p>
          ` 
        ).catch((error) => 
        {
          this.logger.error('Error enviando correo de INTERACCIÓN', error);
        });
      }
       
      return interaction;
    }
    catch (error) 
    {
      this.handleDBExceptions(error);
    }
  }
  async delete(deleteInteractionDto: {id: string}) 
  {
    try 
    {
      const interaction = await this.interactionRepository.findOne({
        where: { id: deleteInteractionDto.id },
        relations: ['recommendation'] 
      });

      if(!interaction) throw new ForbiddenException('Interaction not found');

      const recommendation = await this.recommendationRepository.findOne({
        where: { id: interaction.recommendation.id }
      });

      if(recommendation) 
      {
        if(recommendation.recommendationState === RecommendationState.Inactive) 
        {
          throw new ForbiddenException('Cannot delete an interaction from an inactive recommendation');
        }
      }

      await this.interactionRepository.remove(interaction);
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

  async update( updateInteractionDto: UpdateInteractionDto,groupId: string, user: User, interactionId: string)
  {
    try 
    {
      const interaction = await this.interactionRepository.findOne({
        where:{id: interactionId,
          recommendation:{group:{id: groupId}}

        },
        relations:{
          member: {
            user: true
          },
          recommendation: {group: true}
        }
      }
      )
      if(!interaction) throw new ForbiddenException('Interaction not found');
      const recommendation = await this.recommendationRepository.findOne({where:{id: interaction.recommendation.id}})
      if(recommendation)
      {
        if(recommendation.recommendationState === RecommendationState.Inactive) throw new ForbiddenException('Cannot update an interaction from an inactive recommendation');
      }
      if(interaction.member.user.id !== user.id) throw new ForbiddenException('You can only update your own interactions');
      const updatedInteraction = Object.assign(
        interaction, updateInteractionDto
      )
      await this.interactionRepository.save(updatedInteraction);
      return updatedInteraction;
    }
    catch (error) 
    {
      this.handleDBExceptions(error);
    }
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
