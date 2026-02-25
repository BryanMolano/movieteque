import {Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "../../user/entities/user.entity";
import {Recommendation} from "./recommendation.entity";

@Entity('messages')
export class Message
{
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @CreateDateColumn()
    createdAt: Date;

    @Column({
        type: 'text',
        nullable: false,
    })
    message: string;

    @ManyToOne(() => User)
    @JoinColumn({name: 'user_id'})
    user: User;

    @ManyToOne(() => Recommendation)
    @JoinColumn({name: 'recommendation_id'})
    recommendation: Recommendation;


}
