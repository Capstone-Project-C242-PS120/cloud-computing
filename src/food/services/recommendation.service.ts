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
    const result = this.model.predict(
      tf.tensor2d([[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]], [1, 10]),
    );
    return this.model;
  }
  async getUserFoodHistory(userId: string) {
    // Ambil data riwayat makanan berdasarkan user_id
    const history = await this.foodRateRepository
      .createQueryBuilder('food_rate')
      .leftJoinAndSelect('food_rate.food', 'food')
      .where('food_rate.user_id = :userId', { userId })
      .select([
        'food_rate.rate as rating',
        'food.id as food_id',
        'food.type',
        'food.grade',
        'food.tags',
      ])
      .getRawMany();

    const foodGroups = await this.foodGroupRepository.find();
    const foodGroupMap = foodGroups.reduce((map, group) => {
      map[group.id] = group.name;
      return map;
    }, {});

    const foodHistoryWithTags = history.map((foodHistory) => {
      const tagNames = foodHistory.food_tags
        .map((tagId) => foodGroupMap[tagId] || null)
        .filter(Boolean);

      return {
        id: foodHistory.food_id,
        rating: foodHistory.rating,
        grade: foodHistory.food_grade,
        tags: tagNames, // Ubah ID tags menjadi nama
        type: foodHistory.food_type,
      };
    });
    const result =
      await this.transformDataToTableStructure(foodHistoryWithTags);

    return result;
  }

  async transformDataToTableStructure(data: any[]) {
    // Step 1: Inisialisasi hasil
    const result: any = {};

    // Step 2: Hitung rata-rata semua rating
    const totalRatings = data.reduce((sum, item) => sum + item.rating, 0);
    const averageRating = totalRatings / data.length;

    // Step 3: Tambahkan id_user ke hasil
    result['id_user'] = data[0]?.id || null; // Ambil id user pertama

    // Step 4: Kumpulkan semua key unik (grades, tags, types)
    const grades = new Set<string>();
    const tags = new Set<string>();
    const types = new Set<string>();

    data.forEach((item) => {
      grades.add(item.grade);
      item.tags.forEach((tag: string) => tags.add(tag));
      types.add(item.type);
    });

    // Step 5: Tambahkan semua grades, tags, dan types dengan nilai rata-rata ke hasil
    grades.forEach((grade) => {
      result[grade] = averageRating;
    });

    tags.forEach((tag) => {
      result[tag] = averageRating;
    });

    types.forEach((type) => {
      result[type] = averageRating;
    });

    return result;
  }
}
