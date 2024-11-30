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
import { FoodRate } from 'src/food/entity/food-rate.entity';
import { ScanHistory } from 'src/food/entity/scan-history.entity';

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

  @OneToMany(() => FoodRate, (foodRate) => foodRate.user)
  foodRates: FoodRate[];

  @Column({ type: 'timestamp', nullable: true })
  verified_at: Date;

  @OneToMany(() => FoodHistory, (foodHistory) => foodHistory.user)
  foodHistory: FoodHistory[];
  @OneToMany(() => FoodHistory, (scanHistory) => scanHistory.user)
  scanHistory: ScanHistory[];
}
