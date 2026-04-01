
import {IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength} from "class-validator";

export class ChangeMemberNicknameDto 
{
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(3 )
  @MaxLength(15)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'nickname can only contain letters, numbers, and underscores'
  })
  nickname: string;
}
