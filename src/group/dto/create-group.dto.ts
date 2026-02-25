import {IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString} from "class-validator";
import {GroupType} from "../entities/group.entity";

export class CreateGroupDto
{

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEnum(GroupType)
    @IsOptional()
    type: GroupType;


}
