import {
  Column,
  Entity,
  // ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
// import { Address } from './address.entity';
import { Otp } from 'src/auth/entity/otp.entity';

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

  @Column({ default: false })
  isVerified: boolean;

  @OneToOne(() => Otp, (otp) => otp.user, {
    cascade: true,
    onDelete: 'CASCADE',
    nullable: true, // OTP bisa null
  })
  otp: Otp;
}
