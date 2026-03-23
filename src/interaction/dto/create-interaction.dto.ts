import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from "class-validator";
import { InteractionState, InteractionType } from "../entities/interaction.entity";

export class CreateInteractionDto 
{
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  response: string;

  @IsNotEmpty()
  @IsOptional()
  @Max(5)
  @Min(0)
  @IsNumber({maxDecimalPlaces: 2})
  rating: number;

  @IsUUID()
  @IsNotEmpty()
  memberId: string;

  @IsUUID()
  @IsNotEmpty()
  recommendationId: string;

  @IsEnum(InteractionState)
  state: InteractionState;

  @IsEnum(InteractionType)
  type: InteractionType;
}
