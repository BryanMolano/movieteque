import {Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Movie} from "../../movie/entities/movie.entity";
import {User} from "../../user/entities/user.entity";
import {Group} from "../../group/entities/group.entity";

@Entity('recommendations')
export class Recommendation
{
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @CreateDateColumn()
    createdAt: Date;

    @Column({
        type: 'int',
        nullable: false,
    })
    priority: number;

    @ManyToOne(() => Movie)
    @JoinColumn({name: 'movie_id'})
    movie: Movie;

    @ManyToOne(() => User)
    @JoinColumn({name: 'user_id'})
    user: User;

    @ManyToOne(() => Group)
    @JoinColumn({name: 'group_id'})
    group: Group;
}
