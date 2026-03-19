import {Column, Entity, PrimaryColumn} from "typeorm";

@Entity('movies')
export class Movie
{
  @PrimaryColumn()
  id: string;

  @Column({
    type: 'int',
    nullable: false,
  })
  idTMDB: number;

  @Column({
    type: 'text',
    nullable: true,
  })
  posterUrl: string;

  @Column({
    type: 'text',
    nullable: false,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 10,
    nullable: false,
  })
  language_region: string;
}
