import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('gift')
export class Gift {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  point: number;

  @Column()
  type: string;

  @Column()
  name: string;
}
