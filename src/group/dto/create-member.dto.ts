import {
    IsDateString,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString, IsUUID,
    Matches,
    MaxLength,
    MinLength
} from "class-validator";
import {MemberRole} from "../entities/member.entity";

export class CreateMemberDto
{
    @IsOptional()
    @IsDateString()
    entryDate: Date;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(50)
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

    @IsEnum(MemberRole)
    @IsOptional()
    role: MemberRole;
}