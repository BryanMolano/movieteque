import { ForbiddenException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { User } from 'src/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from './entities/movie.entity';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { MovieSearchResponse } from './interfaces/movie-search-response';
import { TMDBMovieDetailsResponse} from './interfaces/MovieDetails';
import { CreateRecommendationDto } from 'src/recommendation/dto/create-recommendation.dto';
@Injectable()
export class MovieService 
{
  private readonly logger = new Logger('GroupService');
  private readonly TMDBToken:string;
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService 
  )
  {
    this.TMDBToken=this.configService.get('TMDB_TOKEN')!;
  }

  async findAll(term: string, user: User, USER_LOCALE:string) 
  {
    try
    {
      const config={
        params:{
          query: term,
          // language:'es-ES',
          langague: USER_LOCALE || 'en-US',
        },
        headers:{
          Authorization: `Bearer ${this.TMDBToken}`
        }
      }
      const {data}= await firstValueFrom(
        this.httpService.get<MovieSearchResponse>('https://api.themoviedb.org/3/search/movie', config) 
      )
      return data.results.map(movie => ({
        id: movie.id,
        title: movie.title,
        original_title: movie.original_title,
        poster_path: movie.poster_path,
        release_date: movie.release_date
      })
      )
    }
    catch(error)
    {
      this.handleDBExceptions(error)
    }

  }

  async movieDetails(id: string, user:User)
  {
    try
    {
      const config={
        params:{
          language:'es-ES',
          append_to_response: 'credits,videos,watch/providers,images',
          include_image_language:'es,en,null'
        },
        headers:{
          Authorization: `Bearer ${this.TMDBToken}`
        }
      }
      const {data}= await firstValueFrom(
        this.httpService.get<TMDBMovieDetailsResponse>(`https://api.themoviedb.org/3/movie/${id}`, config) 
      )

      const providers= data['watch/providers']?.results?.['CO'];

      return {
        id:data.id,
        title: data.title,
        original_title:data.original_title,
        poster_path: data.poster_path,
        backdrop_path:data.backdrop_path,
        release_date:data.release_date,
        overview: data.overview,
        
        budget:data.budget,
        revenue:data.revenue,
        runtime:data.runtime,
        origin_country:data.origin_country,
        original_language:data.original_language,

        popularity: data.popularity,
        vote_average: data.vote_average,
        vote_count:data.vote_count,

        genres: data.genres.map((genre)=>
        {
          return{
            id:genre.id,
            name:genre.name
          };
        }),
        cast:data.credits.cast.map((actor)=>
        {
          return{
            id:actor.id,
            name:actor.name,
            character:actor.character,
            profile_path:actor.profile_path
          }
        }).slice(0,25),
        directors: data.credits.crew.filter((crewMember)=> crewMember.job === 'Director').map((director)=>
        {
          return{
            id:director.id,
            name:director.name,
            profile_path:director.profile_path,
            job:director.job,
          }
        }),
        writers: data.credits.crew.filter((crewMember)=> crewMember.job === 'Writer'
          ||crewMember.job === 'Screenplay' 
          || crewMember.job === 'Story')
          .map((writer)=>
          {
            return{
              id:writer.id,
              name:writer.name,
              profile_path:writer.profile_path,
              job:writer.job,
            }
          }),
        composers: data.credits.crew.filter((crewMember)=> crewMember.job === 'Original Music Composer'
          ||crewMember.job === 'Additional Music' 
        )
          .map((writer)=>
          {
            return{
              id:writer.id,
              name:writer.name,
              profile_path:writer.profile_path,
              job:writer.job,
            }
          }),
        crew: data.credits.crew.filter((crewMember)=> crewMember.job === 'Producer'
          ||crewMember.job === 'Executive Producer' 
          ||crewMember.job === 'Director of Photography' 
          ||crewMember.job === 'Art Direction' 
          ||crewMember.job === 'Editor' 
          ||crewMember.job === 'Costume Design' 
          ||crewMember.job === 'Casting' 
        )
          .map((crewMember)=>
          {
            return{
              id:crewMember.id,
              name:crewMember.name,
              profile_path:crewMember.profile_path,
              job:crewMember.job,
            }
          })
          .slice(0,40),
        backdrops: data.images.backdrops.map((backdrop)=>
        {
          return{
            file_path:backdrop.file_path,
            height: backdrop.height,
            width: backdrop.width
          }
        }).slice(0,30),
        logos: data.images.logos.map((logo)=>
        {
          return{
            file_path:logo.file_path,
            height: logo.height,
            width: logo.width
          }
        }).slice(0,5),
        posters: data.images.posters.map((poster)=>
        {
          return{
            file_path:poster.file_path,
            height: poster.height,
            width: poster.width
          }
        }).slice(0,20),
        videos: data.videos.results.filter((video)=> video.type === 'Trailer' && video.site === 'Youtube')
          .map((video)=>
          {
            return{
              id:video.id,
              name:video.name,
              key:video.key,
              type:video.type
            }
          }).slice(0,3),
        watch_providers: providers?{
          flatrate: providers.flatrate?.map((provider)=>
          {
            return{
              provider_id:provider.provider_id,
              provider_name:provider.provider_name,
              logo_path:provider.logo_path
            }
          })||[]
        }:null,
      }
    }
    catch(error)
    {
      this.handleDBExceptions(error)
    }
  }

  async ConsultOrCreate(createRecommendationDto: CreateRecommendationDto)
  {
    try
    {
      const {movieId, moviePoster, movieName, USER_LOCALE}= createRecommendationDto;
      const movie = await this.movieRepository.findOneBy({id: `${movieId}-${USER_LOCALE}`});
      if(movie)
      {
        return movie;
      }
      else
      {
        const createdMovie = this.movieRepository.create({
          id: `${movieId}-${USER_LOCALE}`,
          idTMDB: movieId,
          posterUrl: moviePoster,
          name: movieName,
          language_region: USER_LOCALE,
        })
        await this.movieRepository.save(createdMovie);
        return createdMovie;
      }
    }
    catch(error)
    {
      this.handleDBExceptions(error)
    }
  }
  findOne(id: number) 
  {
    return `This action returns a #${id} movie`;
  }

  update(id: number, updateMovieDto: UpdateMovieDto) 
  {
    return `This action updates a #${id} movie`;
  }

  remove(id: number) 
  {
    return `This action removes a #${id} movie`;
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
