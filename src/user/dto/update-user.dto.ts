import { IsString, MinLength, MaxLength, Matches, IsUrl, IsOptional } from "class-validator";

export class UpdateUserDto
{


  @IsString()
  @IsOptional()
  @MinLength(6)
  @MaxLength(50)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers, and underscores'
  })
  username?: string;


  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(400)
  description?: string;

  @IsString()
  @IsUrl()
  @IsOptional()
  imgUrl?: string;
}
