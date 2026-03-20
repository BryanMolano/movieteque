import { Group } from "src/group/entities/group.entity";
import { Movie } from "src/movie/entities/movie.entity";
import { User } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { RecommendationState } from "../interfaces/recommendation-state";

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
}
