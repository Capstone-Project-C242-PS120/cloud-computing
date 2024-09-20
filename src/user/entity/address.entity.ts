import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from './user.entity';

@Entity('address')
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  street: string;

  @Column()
  city: string;

  @Column()
  postalCode: string;

  @OneToMany(() => User, (user) => user.address)
  users: User[];
}
