import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { Member } from "src/member/entities/member.entity";
import { Recommendation } from "src/recommendation/entities/recommendation.entity";

export enum InteractionState
{
  UNSEEN = 'UNSEEN',
  SEEN = 'SEEN',
  SKIPPED = 'SKIPPED',
}

export enum InteractionType
{
  PRIVATE= 'PRIVATE',
  PUBLIC= 'PUBLIC',
}

@Entity('interactions')
// @Index(['member', 'recommendation'], {unique: true})
// la idea es que un miembro pueda poner varias interacciones, ya sea una publica y una privada o varias , da igual
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

  @CreateDateColumn()
  createdAt: Date;

  @Column({
    type: 'enum',
    enum: InteractionState,
    default: InteractionState.UNSEEN
  })
  state: InteractionState;

  @Column({
    type: 'enum',
    enum: InteractionType,
    default: InteractionType.PRIVATE,
  })
  type: InteractionType;
}
