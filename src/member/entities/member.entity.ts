import {Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {User} from "../../user/entities/user.entity";
import { Group } from "src/group/entities/group.entity";
import { ValidRoles } from "src/auth/interfaces/valid-roles.interface";
import { Interaction } from "src/interaction/entities/interaction.entity";

// export enum MemberRole
// {
//   Admin = 'Admin',
//   User = 'User',
// }

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

  @ManyToOne(() => Group, {
    onDelete:'CASCADE'
  })
  @JoinColumn({name: 'group_id'})
  group: Group;

  @ManyToOne(() => User)
  @JoinColumn({name: 'user_id'})
  user: User;

  @Column({
    type: 'enum',
    enum: ValidRoles,
    default: ValidRoles.User,
  })
  role: ValidRoles;

  @Column({
    type: 'bool',
    default: false
  })
  isBanned: boolean;

  @OneToMany(() => Interaction,
    interaction => interaction.recommendation,
    {cascade: true})
  interactions?: Interaction[];

}
