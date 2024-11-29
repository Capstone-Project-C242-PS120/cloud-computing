import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Food } from './food.entity';

@Entity('food_group')
export class FoodGroup {
  @PrimaryGeneratedColumn('increment') // Menggunakan integer sebagai ID
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Food, (food) => food.foodGroup)
  foods: Food[];
}
