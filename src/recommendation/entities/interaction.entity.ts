import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {Member} from "../../group/entities/member.entity";
import {Recommendation} from "./recommendation.entity";
import {GroupType} from "../../group/entities/group.entity";

export enum InteractionState
{
    UNSEEN = 'UNSEEN',
    SEEN = 'SEEN',
    SKIPPED = 'SKIPPED',
}

@Entity('interactions')
@Index(['member', 'recommendation'], {unique: true})
export class Interaction
{

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'text',
        nullable: true,
    })
    response: string;

    @Column({
        type: 'int',
        nullable: true,
    })
    rating: number;

    @ManyToOne(() => Member)
    @JoinColumn({name: 'member_id'})
    member: Member;

    @ManyToOne(() => Recommendation)
    @JoinColumn({name: 'recommendation_id'})
    recommendation: Recommendation;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({
        type: 'enum',
        enum: InteractionState,
        default: InteractionState.UNSEEN
    })
    state: InteractionState;
}