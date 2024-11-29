import { Module } from '@nestjs/common';

import { JwtLoginStrategy } from 'src/auth/jwt/strategies/jwt.strategy';
import { JwtLoginModule } from 'src/auth/jwt/module/jwt.module';
import { FoodService } from './services/food.service';
import { SupabaseService } from './services/supabase.service';
import { FoodController } from './controller/food.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entity/user.entity';
import { FoodHistory } from './entity/food-history.entity';
import { Food } from './entity/food.entity';
import { FoodGroup } from './entity/food-group.entity';

@Module({
  imports: [
    JwtLoginModule,
    TypeOrmModule.forFeature([User, FoodHistory, Food, FoodGroup]),
  ],
  providers: [FoodService, SupabaseService, JwtLoginStrategy],
  controllers: [FoodController],
})
export class FoodModule {}
