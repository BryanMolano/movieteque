import {Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "../../user/entities/user.entity";
import { Group } from "src/group/entities/group.entity";

export enum MemberRole
{
  Admin = 'Admin',
  User = 'User',
}

@Entity('members')
@Index(['group', 'user'], {unique: true})
export class Member
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  entryDate: Date;

  @Column({
    type: 'text',
    nullable: true,
  })
  nickname: string;

  @ManyToOne(() => Group)
  @JoinColumn({name: 'group_id'})
  group: Group;

  @ManyToOne(() => User)
  @JoinColumn({name: 'user_id'})
  user: User;

  @Column({
    type: 'enum',
    enum: MemberRole,
    default: MemberRole.User,
  })
  role: MemberRole;
}
