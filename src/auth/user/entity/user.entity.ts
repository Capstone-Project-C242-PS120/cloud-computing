import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Address } from './address.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ unique: true, nullable: true })
  phoneNumber: string; // Kolom phoneNumber bisa null

  @Column('int', { default: 0 })
  point: number; // Kolom point tanpa relasi foreign key

  @ManyToOne(() => Address, (address) => address.users, {
    nullable: true,
    onDelete: 'SET NULL',
  }) // Foreign key address bisa null
  address: Address;
}
