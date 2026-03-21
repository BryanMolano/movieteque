import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, ParseUUIDPipe } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import { CreateRecommendationDto } from './dto/create-recommendation.dto';
import { UpdateRecommendationDto } from './dto/update-recommendation.dto';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ValidRoles } from 'src/auth/interfaces/valid-roles.interface';
import { MovieService } from 'src/movie/movie.service';

@Controller('recommendation')
export class RecommendationController 
{
  constructor(private readonly recommendationService: RecommendationService,
    private readonly movieService: MovieService
  ) 
  {}

  @Post(':id')
  @Auth(ValidRoles.Admin, ValidRoles.User)
  create(
    @Param('id', ParseUUIDPipe)groupId:string, @GetUser() user:User,
    @Body() createRecommendationDto: CreateRecommendationDto
  ) 
  {
    return this.recommendationService.create(createRecommendationDto, groupId, user);
  }

  @Get()
  @Auth(ValidRoles.Admin, ValidRoles.User)
  findAll(
    @Param('id', ParseUUIDPipe)groupId:string, @GetUser() user:User,
  ) 
  {
    return this.recommendationService.findAll(groupId, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) 
  {
    return this.recommendationService.findOne(+id);
  }
  @Get(':id/complete')
  findOneComplete(@Param('id') id: string) 
  {
    return this.recommendationService.findOneComplete(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRecommendationDto: UpdateRecommendationDto) 
  {
    return this.recommendationService.update(+id, updateRecommendationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) 
  {
    return this.recommendationService.remove(+id);
  }
}
