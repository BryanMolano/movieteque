import {IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl, MinLength, minLength} from "class-validator";
import {GroupType} from "../entities/group.entity";

export class CreateGroupDto
{

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @IsEnum(GroupType)
  @IsOptional()
  type: GroupType;

  @IsString()
  @IsUrl()
  @IsOptional()
  imgUrl?: string;

}
