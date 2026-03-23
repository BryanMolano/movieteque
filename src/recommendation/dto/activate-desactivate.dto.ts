import { IsNotEmpty, IsUUID } from "class-validator";

export class ActivateDesactivateRecommendationDto
{
  @IsNotEmpty()
  @IsUUID()
  id:string;

}
