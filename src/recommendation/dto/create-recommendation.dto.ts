import { IsInt, IsNotEmpty, IsString} from "class-validator";
export class CreateRecommendationDto 
{
  @IsInt()
  movieId: number;

  @IsNotEmpty()
  @IsString()
  moviePoster: string;

  @IsNotEmpty()
  @IsString()
  movieName: string;

  @IsNotEmpty()
  @IsString()
  USER_LOCALE: string;
}
