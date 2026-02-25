import {IsInt, IsNotEmpty, IsString, IsUUID, Max, Min} from "class-validator";

export class CreateRecommendationDto
{

    @IsInt()
    @Min(1)
    @Max(10)
    priority: number;

    @IsUUID()
    @IsNotEmpty()
    movieId: string;

    // @IsInt()
    // @IsNotEmpty()
    // userId: number;

    @IsUUID()
    @IsNotEmpty()
    groupId: string;
}
