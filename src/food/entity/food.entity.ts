import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { FoodGroup } from './food-group.entity';
import { FoodHistory } from './food-history.entity';

@Entity('food')
export class Food {
  @PrimaryGeneratedColumn('increment') // Menggunakan integer sebagai ID
  id: number;

  @Column()
  name: string;

  @Column({ type: 'float' })
  nutriscore: number;

  @Column({ type: 'char', length: 1 })
  grade: string;

  @ManyToMany(() => FoodGroup)
  @JoinTable()
  tags: FoodGroup[];

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

  @ManyToOne(() => FoodGroup, (foodGroup) => foodGroup.foods)
  @JoinColumn({ name: 'tag_id' })
  foodGroup: FoodGroup;

  @OneToMany(() => FoodHistory, (foodHistory) => foodHistory.food)
  foodHistory: FoodHistory[]; // This property links to FoodHistory
}
