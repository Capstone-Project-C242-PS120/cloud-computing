import { User } from 'src/user/entity/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Food } from './food.entity';

@Entity('food_history')
export class FoodHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.foodHistory)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Food, (food) => food.foodHistory)
  @JoinColumn({ name: 'food_id' })
  food: Food;

  @Column({ type: 'timestamp' })
  created_at: Date;
}
