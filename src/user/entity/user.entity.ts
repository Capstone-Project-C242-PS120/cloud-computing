import {
  Column,
  Entity,
  OneToMany,
  // ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
// import { Address } from './address.entity';
import { Otp } from 'src/auth/entity/otp.entity';
import { FoodHistory } from 'src/food/entity/food-history.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ default: 0 })
  point: number;

  @Column({ nullable: true })
  password: string;

  @OneToOne(() => Otp, (otp) => otp.user, {
    cascade: true,
    onDelete: 'CASCADE',
    nullable: true, // OTP bisa null
  })
  otp: Otp;

  @Column({ type: 'timestamp', nullable: true })
  verified_at: Date;

  @OneToMany(() => FoodHistory, (foodHistory) => foodHistory.user)
  foodHistory: FoodHistory[];
}
