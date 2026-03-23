import { ForbiddenException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
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

@Injectable()
export class RecommendationService 
{
  private readonly logger = new Logger('GroupService');
  constructor(
    @InjectRepository(Recommendation)
    private readonly recommendationRepository: Repository<Recommendation>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly movieService : MovieService,
    private readonly groupService: GroupService,
    private readonly dataSource: DataSource,
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
      await queryRunner.commitTransaction();
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
          interactions: true,
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
    throw new InternalServerErrorException('Unexpected error occurred, check server logs');
  }
}
