import { ForbiddenException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateRecommendationDto } from './dto/create-recommendation.dto';
import { UpdateRecommendationDto } from './dto/update-recommendation.dto';
import { User } from 'src/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Recommendation } from './entities/recommendation.entity';
import { MovieService } from 'src/movie/movie.service';
import { GroupService } from 'src/group/group.service';
import { Message } from './entities/message.entity';
import { ActivateDesactivateRecommendationDto } from './dto/activate-desactivate.dto';
import { RecommendationState } from './interfaces/recommendation-state';
import { Member } from 'src/member/entities/member.entity';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class RecommendationService 
{
  private readonly logger = new Logger('GroupService');
  constructor(
    @InjectRepository(Recommendation)
    private readonly recommendationRepository: Repository<Recommendation>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    private readonly movieService : MovieService,
    private readonly groupService: GroupService,
    private readonly dataSource: DataSource,
    private readonly mailService: MailService,
  )
  {
  }
  async create(createRecommendationDto: CreateRecommendationDto, groupId: string, user: User) 
  {
    const movie = await this.movieService.ConsultOrCreate(createRecommendationDto)
    if(!movie) throw new InternalServerErrorException('Movie not found or created trying to asign it to a recommendation')
    const {message, priority}= createRecommendationDto;
    const group = await this.groupService.findOne(groupId, user)

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try
    {
      const newRecommendation = this.recommendationRepository.create({
        priority: priority,
        movie: movie,
        user: user,
        group: group,
      })
      await queryRunner.manager.save(newRecommendation)
      if(message && message.trim().length > 0)
      {
        const recommendationMessage = this.messageRepository.create({
          message: message,
          user:user,
          recommendation: newRecommendation
        })
        await queryRunner.manager.save(recommendationMessage);
      }

      const members = await this.memberRepository.find({
        where: {
          group: {
            id: group?.id,
          }
        },
        relations: ['user'] 
      });

      await queryRunner.commitTransaction();

      const memberToNotify = members.filter(member => member.user.id !== user.id 
        && user.isNotificationEnable 
        && user.isEmailVerified);

      const recommendationLink = `${process.env.FRONTEND_URL}/recommendation/${newRecommendation.id}`;

      Promise.all(
        memberToNotify.map(member => 
        
          this.mailService.sendHtmlEmail(
            member.user.email,
            `Movieteque - recomendacion en ${group?.name} de ${user.username}`,
            'NUEVA RECOMENDACION',
            `
          <p>Hola <b>${member.user.username}</b>,</p>
          <p>${user.username} acaba de recomendar una pelicula en ${group?.name}:</p>
          
          <div style="background-color: #0B2833; color: #CBD3D6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; border: 2px solid #617B85; box-shadow: 4px 4px 0px #595149; margin: 25px 0;">
            ${movie.name} 
          </div>

          <div style="text-align: center; margin-top: 35px; margin-bottom: 10px;">
                <a href="${recommendationLink}" style="display: inline-block; background-color: #CBD3D6; color: #0B2833; text-decoration: none; font-weight: 900; font-family: monospace; font-size: 16px; padding: 12px 24px; border: 2px solid #CBD3D6; box-shadow: 4px 4px 0px #988775; letter-spacing: -0.5px;">
                  [ VER RECOMENDACIÓN ]
                </a>
          </div>

          <p>Si prefieres no recibir notificaciones, puedes desactivarlas en tu perfil de MOVIETEQUE.</p>
        ` 
          )
        )
      ).catch((error) => 
      {
        this.logger.error('error enviando correos de RECOMENDACION', error);
      })
      
      return newRecommendation
    }
    catch(error)
    {
      await queryRunner.rollbackTransaction();
      this.handleDBExceptions(error)
    }
    finally
    {
      await queryRunner.release();
    }
  }

  findAll(groupId: string, user: User)
  {
    try 
    {
      const recommendations = this.recommendationRepository.find({
        where: {group: {id: groupId}}
      })
    }
    catch (error) 
    {
      this.handleDBExceptions(error)
    }
  }

  findOne(id: number) 
  {
    return `This action returns a #${id} recommendation`;
  }
  async findOneComplete(id: string) 
  {
    try 
    {
      const recommendation = await this.recommendationRepository.findOne({
        where:{
          id: id
        },
        relations: {
          movie: true,
          user: true,
          group: {
            members: {
              user: true,
            },
          },
          interactions: {
            member: {
              user: true,
            }
          },
          messages: true,
        }
      })
      return recommendation;
    }
    catch (error) 
    {
      this.handleDBExceptions(error)
    }
  }
  async activateDesactivateRecommendation(activateDesactivateRecommendationDto: ActivateDesactivateRecommendationDto, groupId: string, user: User)
  {
    try
    {
      const {id} = activateDesactivateRecommendationDto;
      const recommendation = await this.recommendationRepository.findOne({
        where:{
          id: id,
          group: {id: groupId},
        }
      })
      if(recommendation)
      {
        recommendation.recommendationState = recommendation.recommendationState === RecommendationState.Active ? RecommendationState.Inactive: RecommendationState.Active;
        await this.recommendationRepository.save(recommendation);
        return recommendation.recommendationState === RecommendationState.Active ? 'activated' : 'deactivated';
      }
    }
    catch(error)
    {
      this.handleDBExceptions(error)
    }
  }

  update(id: number, updateRecommendationDto: UpdateRecommendationDto) 
  {
    return `This action updates a #${id} recommendation`;
  }

  remove(id: number) 
  {
    return `This action removes a #${id} recommendation`;
  }

  private handleDBExceptions(error) 
  {
    this.logger.error(error);
    if(error instanceof ForbiddenException)
    {
      throw error
    }
    if(error instanceof NotFoundException)
    {
      throw error
    }
    throw new InternalServerErrorException('Unexpected error occurred, check server logs');
  }

  async getMessages(groupId: string, user: User, recommendationId: string)
  {
    try 
    {
      const messages = await this.messageRepository.find({
        where:{
          recommendation: {id: recommendationId, group: {id: groupId}},
        },
        relations: {
          user: true,
        },
        order:{
          createdAt: 'ASC',
        }
      })
      if(!messages) throw new NotFoundException('Messages not found for this recommendation')
      if(messages.length === 0) return [];
      return messages;
    }
    catch (error) 
    {
      this.handleDBExceptions(error)
    }
  }
}
