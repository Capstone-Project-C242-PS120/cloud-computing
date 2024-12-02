import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FoodHistory } from '../entity/food-history.entity';
import { Repository } from 'typeorm';
import { FoodService } from './food.service';
import { FoodGroup } from '../entity/food-group.entity';
import { Food } from '../entity/food.entity';
import { FoodRate } from '../entity/food-rate.entity';
import * as tf from '@tensorflow/tfjs-node';

@Injectable()
export class RecommendationService implements OnModuleInit {
  constructor(
    @InjectRepository(FoodHistory)
    private foodHistoryRepository: Repository<FoodHistory>,
    @InjectRepository(FoodRate)
    private foodRateRepository: Repository<FoodRate>,
    @InjectRepository(Food)
    private foodRepository: Repository<Food>,
    @InjectRepository(FoodGroup)
    private foodGroupRepository: Repository<FoodGroup>,
    private readonly foodService: FoodService,
  ) {}
  private model: tf.LayersModel;

  async loadModel(modelPath: string): Promise<void> {
    // console.log(modelPath);
    // this.model = await tf.loadLayersModel(modelPath);

    try {
      this.model = await tf.loadLayersModel(modelPath);
      //   this.model = await tf.node.loadSavedModel(modelPath);
      console.log('Model loaded');
    } catch (error) {
      console.error('Error loading model:', error);
    }
  }
  async onModuleInit() {
    // const modelPath = process.env.MODEL_RECOMMENDATION_URI;
    // console.log('Lagi load model');
    // const modelPath = `file://${path.resolve(__dirname, '../../model/model.json')}`;
    const modelPath = `file:///Users/ramadhanial-qadri/Documents/My_File/Programming/NODE/Express/nest-app/model/model.json`;

    if (modelPath) {
      //   await this.loadModel(modelPath);
    } else {
      console.error('MODEL_PATH is not defined in .env');
    }
  }

  async testModel() {
    return this.model;
  }
}
