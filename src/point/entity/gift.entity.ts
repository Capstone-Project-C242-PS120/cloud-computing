import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('gift')
export class Gift {
  @PrimaryColumn({ type: 'varchar' }) // Tipe data sesuai kebutuhan
  id: string;

  @Column()
  point: number;

  @Column()
  type: string;

  @Column()
  name: string;
}
