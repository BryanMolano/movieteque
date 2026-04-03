import { IsString, MinLength, MaxLength, Matches, IsUrl, IsOptional} from "class-validator";

export class UpdateUserDto
{
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers, and underscores'
  })
  username?: string;

  @IsString()
  @IsOptional()
  @MaxLength(400)
  description?: string;

  @IsString()
  @IsUrl()
  @IsOptional()
  imgUrl?: string;

  @IsString()
  @IsOptional()
  @MinLength(6)
  @MaxLength(50)
  @Matches(
    /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
      message: 'The oldPassword must have a Uppercase, lowercase letter and a number'
    })
  oldPassword: string;

  @IsString()
  @IsOptional()
  @MinLength(6)
  @MaxLength(50)
  @Matches(
    /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
      message: 'The newPassword must have a Uppercase, lowercase letter and a number'
    })
  newPassword: string;
}
