import {Column, Entity, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";

@Entity('movies')
export class Movie
{
    @PrimaryColumn()
    id: string;

    @Column({
        type: 'text',
        nullable: true,
    })
    posterUrl: string;

    @Column({
        type: 'text',
        nullable: false,
    })
    name: string;
}
