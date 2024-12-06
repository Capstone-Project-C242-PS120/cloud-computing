import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FoodHistory } from '../entity/food-history.entity';
import { Repository } from 'typeorm';
import { FoodService } from './food.service';
import { FoodGroup } from '../entity/food-group.entity';
import { Food } from '../entity/food.entity';
import { FoodRate } from '../entity/food-rate.entity';
import * as tf from '@tensorflow/tfjs-node';
import * as fs from 'fs';
import * as csv from 'csv-parser';
import * as fsp from 'fs/promises';
import axios from 'axios';

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
  private product: any[][] = [];
  private dataset: any[][] = [];
  private features: string[] = [];

  async downloadFile(url: string, destination: string): Promise<void> {
    try {
      const response = await axios.get(url, { responseType: 'stream' });
      const writer = fs.createWriteStream(destination);

      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
    } catch (error) {
      console.error(`Failed to download file from ${url}:`, error.message);
      throw new Error(`Error downloading file: ${url}`);
    }
  }

  async loadModelAndDataset(modelPath: string): Promise<void> {
    const tempDir = './temp';
    try {
      // Validasi model path
      if (!modelPath) throw new Error('Model path is not defined');

      this.model = await tf.loadLayersModel(modelPath);

      // Pastikan directory sementara tersedia
      await fsp.mkdir(tempDir, { recursive: true });

      // File paths
      const itemFilePath = `${tempDir}/item.csv`;
      const datasetFilePath = `${tempDir}/dataset.csv`;
      const featureFilePath = `${tempDir}/feature.json`;

      await this.downloadFile(process.env.ITEM_URL, itemFilePath);
      await this.downloadFile(process.env.DATASET_URL, datasetFilePath);
      await this.downloadFile(process.env.FEATURE_URL, featureFilePath);

      this.product = await this.loadnormalcsvData(itemFilePath);
      this.dataset = await this.loadCsvData(datasetFilePath);

      const featureFileContent = await fsp.readFile(featureFilePath, 'utf-8');
      this.features = JSON.parse(featureFileContent);
    } catch (error) {
      console.error('Error loading model or dataset:', error.message);
    } finally {
      // Hapus file sementara
      try {
        await fsp.rm(tempDir, { recursive: true, force: true });
      } catch (cleanupError) {
        console.error(
          'Failed to clean up temporary files:',
          cleanupError.message,
        );
      }
    }
  }
  async onModuleInit() {
    const modelPath = process.env.MODEL_RECOMMENDATION_URI;

    if (modelPath) {
      await this.loadModelAndDataset(modelPath);
    } else {
      console.error('MODEL_PATH is not defined in .env');
    }
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
    // console.log(history);
    if (!history || history.length === 0) {
      return null;
    }
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

    // Step 2: Hitung rata-rata semua rating dari food history pengguna
    const totalRatings = data.reduce((sum, item) => sum + item.rating, 0);
    const averageRating = data.length > 0 ? totalRatings / data.length : 0;

    // Step 4: Baca fitur dari file JSON

    let allFeatures: string[] = [];
    try {
      // Ambil hanya nilai dari JSON (fitur)
      allFeatures = Object.values(this.features);
    } catch (error) {
      console.error('Error reading feature file:', error.message);
      throw new Error('Could not read features from file.');
    }

    // Step 5: Kumpulkan semua fitur dari data pengguna
    const userFeatures = new Set<string>();

    data.forEach((item) => {
      userFeatures.add(item.grade);
      item.tags.forEach((tag: string) => userFeatures.add(tag));
      userFeatures.add(item.type);
    });

    // Step 6: Tambahkan nilai untuk setiap fitur dari file JSON
    allFeatures.forEach((feature) => {
      result[feature] = userFeatures.has(feature) ? averageRating : 0;
    });

    // console.log('Result:', result);

    return result;
  }
  // async transformDataToTableStructure(data: any[], userId: string) {
  //   // Step 1: Inisialisasi hasil
  //   const result: any = {};

  //   // Step 2: Hitung rata-rata semua rating dari food history pengguna
  //   const totalRatings = data.reduce((sum, item) => sum + item.rating, 0);
  //   const averageRating = data.length > 0 ? totalRatings / data.length : 0;

  //   // Step 3: Tambahkan id_user ke hasil
  //   result['id_user'] = userId;

  //   // Step 4: Ambil semua grades
  //   const allGrades = ['A', 'B', 'C', 'D', 'E'];

  //   // Step 5: Ambil semua types
  //   const allTypes = ['kemasan', 'non-kemasan'];

  //   // Step 6: Ambil semua food group (nama dari table food_group)
  //   const foodGroups = await this.foodGroupRepository.find();
  //   const allTags = foodGroups.map((group) => group.name);

  //   // Step 7: Kumpulkan semua grades, tags, dan types dari data pengguna
  //   const gradesFromUser = new Set<string>();
  //   const tagsFromUser = new Set<string>();
  //   const typesFromUser = new Set<string>();

  //   data.forEach((item) => {
  //     gradesFromUser.add(item.grade);
  //     item.tags.forEach((tag: string) => tagsFromUser.add(tag));
  //     typesFromUser.add(item.type);
  //   });

  //   // Step 8: Tambahkan nilai untuk semua grades
  //   allGrades.forEach((grade) => {
  //     result[grade] = gradesFromUser.has(grade) ? averageRating : 0;
  //   });

  //   // Step 9: Tambahkan nilai untuk semua tags (food group)
  //   allTags.forEach((tag) => {
  //     result[tag] = tagsFromUser.has(tag) ? averageRating : 0;
  //   });

  //   // Step 10: Tambahkan nilai untuk semua types
  //   allTypes.forEach((type) => {
  //     result[type] = typesFromUser.has(type) ? averageRating : 0;
  //   });

  //   return result;
  // }

  async loadCsvData(path: string): Promise<any[][]> {
    const df_item: any[][] = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream(path)
        .pipe(csv())
        .on('data', (row) => {
          // Konversi row ke array
          const rowValues = Object.values(row).map(
            (value) => parseFloat(value as string) || 0, // Gunakan type assertion (value as string)
          );
          df_item.push(rowValues);
        })
        .on('end', () => {
          resolve(df_item);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }
  async loadnormalcsvData(path: string): Promise<any[]> {
    const kodeList: string[] = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream(path)
        .pipe(csv())
        .on('data', (row) => {
          if (row.kode) {
            kodeList.push(row.kode); // Tambahkan hanya kolom `kode`
          }
        })
        .on('end', () => {
          resolve(kodeList);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  processDataset(df_item: any[][]): tf.Tensor2D {
    return tf.tensor2d(df_item);
  }

  async predict(
    recommendationTensor: tf.Tensor2D,
    userID: string,
  ): Promise<any> {
    const userData = await this.getUserFoodHistory(userID);
    if (!userData) {
      return null;
    }
    // console.log('User Data:', userData);

    if (!userData || Object.keys(userData).length === 0) {
      throw new Error(`No valid data found`);
    }

    // console.log('User Data:', userData);
    // console.log(userData)

    // Pastikan mengambil hanya nilai yang sesuai dengan fitur
    const userValues = Object.values(userData) as number[]; // Hilangkan id_user
    // const userValues = userData;
    if (!userValues || userValues.length === 0) {
      throw new Error(`Invalid user data for userID: ${userID}`);
    }
    // console.log(userValues);

    const userValuesProcessed = this.processSingleData(userValues, 1000);
    // console.log('Processed User Data:', userValuesProcessed);

    // Konversi userData ke tensor
    const newUserTensor = tf.tensor2d(userValuesProcessed);

    // console.log('New User Tensor:', newUserTensor);

    // Prediksi menggunakan model
    const predictions = this.model.predict([
      newUserTensor,
      recommendationTensor,
    ]) as tf.Tensor;

    // Ambil hasil prediksi sebagai array
    const result = await predictions.array();
    // console.log('Predictions:', result);

    // Kembalikan hasil prediksi
    return result;
  }
  processPredictions(
    predictions: number[][],
    dataItems: string[],
  ): { sortedPredictions: number[]; sortedItems: string[] } {
    // Step 1: Balikkan transformasi prediksi
    const originalPredictions = this.inverseTransformPredictions(predictions);

    // Step 2: Urutkan indeks berdasarkan nilai prediksi
    const sortedIndices = this.getSortedIndices(originalPredictions);

    // Step 3: Ambil item berdasarkan urutan indeks
    const sortedItems = sortedIndices.map((index) => dataItems[index]);

    return { sortedPredictions: sortedIndices, sortedItems };
  }

  async runRecommendation(userID: string) {
    const recommendationTensor = this.processDataset(this.dataset);
    // console.log('Recommendation Tensor:', recommendationTensor);
    // console.log('Recommendation Tensor:', recommendationTensor);
    const prediction = await this.predict(recommendationTensor, userID);

    if (!prediction) {
      return {};
    }
    const originalPredictions = this.inverseTransformPredictions([prediction]);
    const sortedIndices = this.getSortedIndices(originalPredictions);
    // const result = this.processPredictions([prediction], df_item);
    // const sortedProducts = sortedIndices.map((index) => this.product[index]);
    return await this.getTop10Foods(sortedIndices);
  }

  async getTop10Foods(sortedIndices: number[]): Promise<any[]> {
    const maxFoods = 10;
    const topFoods = [];
    // Ambil daftar food group untuk mapping ID ke nama
    const foodGroups = await this.foodGroupRepository.find();
    const foodGroupMap = foodGroups.reduce((map, group) => {
      map[group.id] = group.name;
      return map;
    }, {});

    // Ambil hanya 10 indeks pertama dari sortedIndices
    const limitedIndices = sortedIndices.slice(0, maxFoods);

    for (const index of limitedIndices) {
      const productId = this.product[index] as unknown as number;

      if (!productId) {
        continue; // Jika tidak ada ID produk, lewati
      }

      // Cek keberadaan produk di database dan hanya ambil kolom tertentu
      const food = await this.foodRepository.findOne({
        where: { id: productId },
        select: ['id', 'name', 'grade', 'tags', 'image_url', 'type'], // Kolom yang akan diambil
      });

      if (food) {
        // Ganti ID tags dengan nama menggunakan foodGroupMap
        const tagNames = food.tags
          .map((tagId) => foodGroupMap[tagId] || null)
          .filter(Boolean);

        // Tambahkan food dengan tags yang telah diganti ke hasil
        topFoods.push({
          id: food.id,
          name: food.name,
          grade: food.grade,
          tags: tagNames,
          image_url: food.image_url,
          type: food.type,
        });
      }
    }

    // Jika tidak ditemukan data sama sekali, kembalikan array kosong
    return topFoods.length > 0 ? topFoods : [];
  }

  // Fungsi untuk melakukan scaling, tiling, dan reshape
  processSingleData(data: number[], repeats: number): number[][] {
    // Step 1: Scaling (Standardisasi)
    this.fitScaler(data);
    const scaledData = this.transformScaler(data);

    // Step 2: Repeat data (tile)
    const repeatedData = Array(repeats).fill(scaledData);

    return repeatedData;
  }

  private mean = 0;
  private stdDev = 0;

  // Fungsi untuk menghitung mean dan standard deviation
  fitScaler(data: number[]): void {
    const n = data.length;

    // Hitung mean
    this.mean = data.reduce((sum, value) => sum + value, 0) / n;

    // Hitung standard deviation
    this.stdDev = Math.sqrt(
      data.reduce((sum, value) => sum + Math.pow(value - this.mean, 2), 0) / n,
    );
  }

  // Transform data (standardisasi)
  transformScaler(data: number[]): number[] {
    return data.map((value) => (value - this.mean) / (this.stdDev || 1));
  }
  // Fungsi untuk membalik transformasi prediksi ke skala asli
  inverseTransformPredictions(predictions: number[][]): number[][] {
    return predictions.map((row) =>
      row.map((value) => value * this.stdDev + this.mean),
    );
  }

  // Fungsi untuk mengurutkan prediksi berdasarkan nilai tertinggi
  getSortedIndices(predictions: number[][]): number[] {
    // Ambil nilai prediksi sebagai array 1D
    const flattenedPredictions = predictions.flat();

    // Urutkan indeks berdasarkan nilai descending
    return flattenedPredictions
      .map((value, index) => ({ value, index }))
      .sort((a, b) => b.value - a.value) // Urutkan descending
      .map((item) => item.index); // Ambil hanya indeks
  }
}
