import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min} from "class-validator";
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

  @IsOptional()
  @IsString()
  message?:string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(10)
  priority: number;
}
