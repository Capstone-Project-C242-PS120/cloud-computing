import { User } from 'src/user/entity/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';

@Entity('otp')
export class Otp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  otp: string; // Store hashed OTP

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  expiresAt: Date;

  @ManyToOne(() => User, (user) => user.otp, {
    onDelete: 'CASCADE', // Jika user dihapus, OTP juga akan dihapus
  })
  user: User;

  @Column('uuid') // Foreign key untuk user disimpan sebagai UUID
  userId: string;
}
