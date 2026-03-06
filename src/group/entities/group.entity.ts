import { Member } from "src/member/entities/member.entity";
import { Recommendation } from "src/recommendation/entities/recommendation.entity";
import {Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";

export enum GroupType
{
  PRIVATE= 'PRIVATE',
  PUBLIC= 'PUBLIC',
}

@Entity('groups')
export class Group
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'text',
  })
  name: string;

  @Column({
    type: 'enum',
    enum: GroupType,
    default: GroupType.PRIVATE,
  })
  type: GroupType;
  
  @Column({
    type: 'text',
    nullable: true,
  })
  imgUrl: string;

  @OneToMany(() => Member,
    member => member.group,
    {cascade: true})
  members?: Member[];

  @OneToMany(() => Recommendation,
    recommendation=> recommendation.group,
    {cascade: true})
  recommendations?: Recommendation[];

  @CreateDateColumn()
  created_at: Date;
}
