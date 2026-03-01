import { Member } from "src/member/entities/member.entity";
import {Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";

export enum GroupType
{
  PRUEBA = 'PRUEBA',
  PRUEBA1 = 'PRUEBA1',
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
    default: GroupType.PRUEBA,
  })
  type: GroupType;
  
  @OneToMany(() => Member,
    member => member.group,
    {cascade: true})
  members?: Member[];

  @CreateDateColumn()
  created_at: Date;
}
