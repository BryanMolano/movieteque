import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { MovieService } from './movie.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/user/entities/user.entity';

@Controller('movie')
export class MovieController 
{
  constructor(private readonly movieService: MovieService) 
  {}

  @Post()
  create(@Body() createMovieDto: CreateMovieDto) 
  {
    return this.movieService.create(createMovieDto);
  }

  @Get(':term/search')
  @UseGuards(AuthGuard('jwt'))
  findAll(@Param('term')term:string, @GetUser() user:User) 
  {
    return this.movieService.findAll(term, user);
  }
  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  movieDetails(@Param('term')id:string, @GetUser() user:User) 
  {
    return this.movieService.movieDetails(id, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) 
  {
    return this.movieService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMovieDto: UpdateMovieDto) 
  {
    return this.movieService.update(+id, updateMovieDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) 
  {
    return this.movieService.remove(+id);
  }
}
