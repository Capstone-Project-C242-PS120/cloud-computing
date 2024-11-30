import { IsNumber, IsOptional } from 'class-validator';

export class EatFoodDTO {
  @IsNumber()
  food_id: number;

  @IsOptional()
  @IsNumber()
  food_rate: number;
}
