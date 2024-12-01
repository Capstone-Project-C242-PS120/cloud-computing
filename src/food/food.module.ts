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
import { FoodRate } from './entity/food-rate.entity';
import { ScanHistory } from './entity/scan-history.entity';
import { RecommendationService } from './services/recommendation.service';

@Module({
  imports: [
    JwtLoginModule,
    TypeOrmModule.forFeature([
      User,
      FoodHistory,
      Food,
      FoodGroup,
      FoodRate,
      ScanHistory,
    ]),
  ],
  providers: [
    FoodService,
    SupabaseService,
    JwtLoginStrategy,
    RecommendationService,
  ],
  controllers: [FoodController],
})
export class FoodModule {}
