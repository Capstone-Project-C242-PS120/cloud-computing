import { User } from 'src/user/entity/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Food } from './food.entity';

@Entity('food_rate')
export class FoodRate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.foodRates)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Food, (food) => food.foodRates)
  @JoinColumn({ name: 'food_id' })
  food: Food;

  @Column('int')
  rate: number;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column('timestamp', {
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
