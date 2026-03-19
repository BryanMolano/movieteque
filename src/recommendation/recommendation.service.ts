import { Injectable } from '@nestjs/common';
import { CreateRecommendationDto } from './dto/create-recommendation.dto';
import { UpdateRecommendationDto } from './dto/update-recommendation.dto';
import { User } from 'src/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recommendation } from './entities/recommendation.entity';
import { MovieService } from 'src/movie/movie.service';

@Injectable()
export class RecommendationService 
{
  constructor(
    @InjectRepository(Recommendation)
    private readonly recommendationRepository: Repository<Recommendation>,
    private readonly movieService : MovieService
  )
  {
  }
  create(createRecommendationDto: CreateRecommendationDto, groupId:number, user: User) 
  {
  }

  findAll() 
  {
    return `This action returns all recommendation`;
  }

  findOne(id: number) 
  {
    return `This action returns a #${id} recommendation`;
  }

  update(id: number, updateRecommendationDto: UpdateRecommendationDto) 
  {
    return `This action updates a #${id} recommendation`;
  }

  remove(id: number) 
  {
    return `This action removes a #${id} recommendation`;
  }
}
