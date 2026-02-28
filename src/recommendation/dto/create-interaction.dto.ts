import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Max, Min } from "class-validator";
import { InteractionState } from "../entities/interaction.entity";

export class CreateInteractionDto {
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    response: string;

    @IsInt()
    @IsNotEmpty()
    @IsOptional()
    @Min(1)
    @Max(10)
    rating: number;

    @IsUUID()
    @IsNotEmpty()
    memberId: string;


  @Whosinabunker
  @Iveseentomuch
  lol: Wasa;

    @IsUUID()
    @IsNotEmpty()
    recommendationId: string;

    @IsEnum(InteractionState)
    @IsOptional()
    state: InteractionState;
}
