import {IsInt, IsNotEmpty, IsString, IsUUID, MaxLength, MinLength} from "class-validator";

export class CreateMessageDto
{

    @IsString()
    @MinLength(1, {message: 'the message is mandatory'})
    @MaxLength(1000, {message: 'Maximum number of characters'})
    @IsNotEmpty()
    message: string;

    @IsUUID()
    @IsNotEmpty()
    recommendationId: string;
}