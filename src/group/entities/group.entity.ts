import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn} from "typeorm";

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


    @CreateDateColumn()
    created_at: Date;
}
