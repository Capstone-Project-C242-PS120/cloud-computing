import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { FoodHistory } from './food-history.entity';
import { FoodRate } from './food-rate.entity';

@Entity('food')
export class Food {
  @PrimaryGeneratedColumn('increment') // Menggunakan integer sebagai ID
  id: number;

  @Column()
  name: string;

  @Column('double precision')
  nutriscore: number;

  @Column({ type: 'char', length: 1 })
  grade: string;

  @Column('jsonb', { nullable: true })
  tags: string[];

  @Column('double precision')
  calories: number;

  @Column('double precision')
  fat: number;

  @Column('double precision')
  sugar: number;

  @Column('double precision')
  fiber: number;

  @Column('double precision')
  protein: number;

  @Column('double precision')
  natrium: number;

  @Column('double precision')
  vegetable: number;

  @Column()
  image_url: string;

  @Column()
  image_nutrition_url: string;

  @Column()
  type: string;

  @OneToMany(() => FoodRate, (foodRate) => foodRate.food)
  foodRates: FoodRate[];

  @OneToMany(() => FoodHistory, (foodHistory) => foodHistory.food)
  foodHistory: FoodHistory[]; // This property links to FoodHistory
}
