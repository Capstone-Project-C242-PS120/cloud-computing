import { Module } from '@nestjs/common';
import { FoodService } from './food.service';
import { FoodController } from './food.controller';
import { SupabaseService } from './supabase.service';
import { JwtLoginStrategy } from 'src/auth/jwt/strategies/jwt.strategy';
import { JwtLoginModule } from 'src/auth/jwt/module/jwt.module';

@Module({
  imports: [JwtLoginModule],
  providers: [FoodService, SupabaseService, JwtLoginStrategy],
  controllers: [FoodController],
})
export class FoodModule {}
