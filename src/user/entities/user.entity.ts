import { Member } from "src/member/entities/member.entity";
import {Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";

@Entity('users')
export class User
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'text',
    unique: true,
  })
  email: string;

  @Column({
    type: 'varchar',
    nullable: true,
    unique: true,
  })
  googleId: string;

  @Column({
    type: 'text',
    nullable: true,
    select: false,
  })
  password: string;

  @Column({
    type: 'text',
    unique: true,
  })
  username: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  imgUrl: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @OneToMany(() => Member,
    member => member.user,
    {cascade: true})
  members?: Member[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
