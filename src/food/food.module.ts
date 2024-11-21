import { Module } from '@nestjs/common';
import { FoodService } from './food.service';
import { FoodController } from './food.controller';
import { SupabaseService } from './supabase.service';

@Module({
  providers: [FoodService, SupabaseService],
  controllers: [FoodController],
})
export class FoodModule {}
