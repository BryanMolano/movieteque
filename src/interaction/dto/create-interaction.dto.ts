import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Max } from "class-validator";
import { InteractionState, InteractionType } from "../entities/interaction.entity";

export class CreateInteractionDto 
{
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  response: string;

  @IsInt()
  @IsNotEmpty()
  @IsOptional()
  @Max(5)
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
