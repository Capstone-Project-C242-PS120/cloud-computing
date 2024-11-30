import { Injectable } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { ILike, Repository } from 'typeorm';
import { Food } from '../entity/food.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FoodGroup } from '../entity/food-group.entity';
import { AnalyzeFoodSaveDto } from '../dto/analyze-food-save.dto';

@Injectable()
export class FoodService {
  constructor(
    @InjectRepository(Food)
    private foodRepository: Repository<Food>,
    @InjectRepository(FoodGroup)
    private foodGroupRepository: Repository<FoodGroup>,
    private readonly supabaseService: SupabaseService,
  ) {}

  async getFoodById(id: number): Promise<Food> {
    const food = await this.foodRepository.findOne({ where: { id: id } });

    if (!food) {
      throw new Error('Food not found');
    }

    // Ambil nama-nama FoodGroup berdasarkan tag ID yang ada di Food
    const tagsNames = await this.foodGroupRepository
      .createQueryBuilder('food_group')
      .where('food_group.id IN (:...ids)', { ids: food.tags })
      .getMany();

    // Map tags IDs ke nama FoodGroup
    food.tags = tagsNames.map((tag) => tag.name); // Ganti tags dengan nama FoodGroup

    return food;
  }

  async getFoods(
    page: number = 1,
    limit: number = 10,
    name: string = '',
    tags: number[] = [],
  ): Promise<any> {
    const skip = (page - 1) * limit; // Menghitung offset berdasarkan halaman yang diminta
    const whereConditions: any = {};

    // Filter berdasarkan nama makanan jika ada (case-insensitive)
    if (name) {
      whereConditions.name = ILike(`%${name}%`); // Menggunakan ILike untuk pencarian tanpa memperhatikan kapitalisasi
    }

    // Membuat query dengan QueryBuilder
    const queryBuilder = this.foodRepository.createQueryBuilder('food');

    // Filter berdasarkan tags jika ada
    if (tags.length > 0) {
      queryBuilder.andWhere('food.tags @> :tags', {
        tags: JSON.stringify(tags),
      });
    }

    // Menambahkan kondisi pencarian berdasarkan nama
    if (name) {
      queryBuilder.andWhere('food.name ILIKE :name', { name: `%${name}%` });
    }

    // Menambahkan pagination
    queryBuilder.skip(skip).take(limit);

    queryBuilder.select([
      'food.id',
      'food.name',
      'food.tags',
      'food.grade',
      'food.image_url',
      'food.type',
    ]);

    // Eksekusi query untuk mendapatkan data yang sesuai dengan filter dan pagination
    const foods = await queryBuilder.getMany();

    // Menghitung jumlah total data berdasarkan filter yang sama (tags dan name)
    const countQueryBuilder = this.foodRepository.createQueryBuilder('food');

    if (tags.length > 0) {
      countQueryBuilder.andWhere('food.tags @> :tags', {
        tags: JSON.stringify(tags),
      });
    }

    if (name) {
      countQueryBuilder.andWhere('food.name ILIKE :name', {
        name: `%${name}%`,
      });
    }

    const total = await countQueryBuilder.getCount(); // Hitung total berdasarkan filter yang sama

    // Menghitung jumlah total halaman (total data / limit per halaman)
    const totalPages = Math.ceil(total / limit);

    // Mengambil nama-nama FoodGroup berdasarkan tag ID yang ada di setiap Food
    for (const food of foods) {
      // Ambil tags yang ada di dalam array tags
      const tagsNames = await this.foodGroupRepository
        .createQueryBuilder('food_group')
        .where('food_group.id IN (:...ids)', { ids: food.tags })
        .getMany();

      // Map tags IDs ke nama FoodGroup
      // console.log(tagsNames);
      food.tags = tagsNames.map((tag) => tag.name); // Ganti tags dengan nama FoodGroup
    }

    return {
      data: foods,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async uploadFile(
    bucketName: string,
    filePath: string,
    file: Buffer,
    mimeType: string,
  ): Promise<any> {
    const supabase = this.supabaseService.getSupabaseClient();

    await supabase.storage.from(bucketName).upload(filePath, file, {
      contentType: mimeType,
    });

    const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);

    return data;
  }

  async analyzeFoodNutrition(): Promise<Food> {
    const FoodExample = {
      nutriscore: -2.1,

      grade: 'A',
      type: 'kemasan',
      calories: 50.5,
      fat: 0.5,
      sugar: 0.5,
      fiber: 0.5,
      protein: 0.5,
      natrium: 0.5,
      vegetable: 0.5,
    } as Food;

    return FoodExample;
  }

  async updateFoodImage(foodId: number, imageUrl: string): Promise<Food> {
    const food = await this.foodRepository.findOne({ where: { id: foodId } });

    if (!food) {
      throw new Error('Food not found');
    }

    food.image_url = imageUrl;

    const updatedFood = await this.foodRepository.save(food);

    return updatedFood;
  }

  async saveFood(saveFoodDto: AnalyzeFoodSaveDto): Promise<Food> {
    const food = this.foodRepository.create({
      name: saveFoodDto.name,
      nutriscore: saveFoodDto.nutriscore,
      tags: saveFoodDto.tags.split(',').map(String),
      grade: saveFoodDto.grade,
      type: saveFoodDto.type,
      calories: saveFoodDto.calories,
      fat: saveFoodDto.fat,
      sugar: saveFoodDto.sugar,
      fiber: saveFoodDto.fiber,
      protein: saveFoodDto.protein,
      natrium: saveFoodDto.natrium,
      vegetable: saveFoodDto.vegetable,
      image_url: '',
      image_nutrition_url: '',
    });

    const savedFood = await this.foodRepository.save(food);

    // console.log(savedFood);

    return savedFood;
  }

  //   async getPublicUrl(bucketName: string, filePath: string): Promise<string> {
  //     const supabase = this.supabaseService.getSupabaseClient();

  //     const { publicUrl } = supabase.storage
  //       .from(bucketName)
  //       .getPublicUrl(filePath);

  //     return publicUrl;
  //   }
}