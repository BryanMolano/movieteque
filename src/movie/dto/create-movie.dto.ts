import {IsNotEmpty, IsOptional, IsString, IsUrl} from 'class-validator';

export class CreateMovieDto
{
    @IsString()
    @IsNotEmpty({message: 'El ID de la película es obligatorio'})
    id: string;

    @IsString()
    @IsNotEmpty({message: 'El nombre de la película no puede estar vacío'})
    name: string;

    @IsUrl({}, {message: 'El posterUrl debe ser un enlace web válido'})
    @IsOptional()
    posterUrl?: string;

}