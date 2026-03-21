import { Group } from "src/group/entities/group.entity";
import { Movie } from "src/movie/entities/movie.entity";
import { User } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { RecommendationState } from "../interfaces/recommendation-state";
import { Member } from "src/member/entities/member.entity";
import { Interaction } from "src/interaction/entities/interaction.entity";
import { Message } from "./message.entity";

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
  @JoinColumn({ name: 'movie_id' })
  movie: Movie;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Group)
  @JoinColumn({ name: 'group_id' })
  group: Group;

  @Column({
    type: 'enum',
    enum: RecommendationState,
    default: RecommendationState.Active,
  })
  recommendationState: RecommendationState;

  @OneToMany(() => Interaction,
    interaction => interaction.recommendation,
    {cascade: true})
  interactions?: Interaction[];

  @OneToMany(() => Message,
    message => message.recommendation,
    {cascade: true})
  messages?: Message[];
}
