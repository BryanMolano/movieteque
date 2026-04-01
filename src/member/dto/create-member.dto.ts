import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString, IsUUID,
  Matches,
  MaxLength,
  MinLength
} from "class-validator";
import { ValidRoles } from "src/auth/interfaces/valid-roles.interface";

export class CreateMemberDto
{
  @IsOptional()
  @IsDateString()
  entryDate: Date;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(33)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'nickname can only contain letters, numbers, and underscores'
  })
  nickname: string;

  @IsUUID()
  @IsNotEmpty()
  groupId: string;

  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsEnum(ValidRoles)
  @IsOptional()
  role: ValidRoles;
}

