import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Address } from './address.entity';
import { Otp } from './otp.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ unique: true, nullable: true })
  phoneNumber: string; // Kolom phoneNumber bisa null

  @Column('int', { default: 0 })
  point: number; // Kolom point tanpa relasi foreign key

  @Column({ default: false })
  isVerified: boolean;

  @ManyToOne(() => Address, (address) => address.users, {
    nullable: true,
    onDelete: 'SET NULL',
  }) // Foreign key address bisa null
  address: Address;

  @OneToMany(() => Otp, (otp) => otp.users, { cascade: true })
  otps: Otp[];
}
