import { IsUUID, IsNotEmpty } from "class-validator";

export class DeleteInteractionDto
{
  @IsUUID()
  @IsNotEmpty()
  id: string;
}
