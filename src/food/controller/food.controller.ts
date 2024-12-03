import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  HttpStatus,
  UseGuards,
  Get,
  Query,
  Body,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';

import { ResponseWrapper } from 'src/common/wrapper/response.wrapper';
import { JwtLoginAuthGuard } from 'src/auth/jwt/guards/jwt.guard';
import { FoodService } from '../services/food.service';
import { FoodResponseWrapper } from 'src/common/wrapper/food-response.wrapper';
import { AnalyzeFoodSaveDto } from '../dto/analyze-food-save.dto';
import { EatFoodDTO } from '../dto/eat-food-save.dto';
import { RecommendationService } from '../services/recommendation.service';

@Controller('food')
export class FoodController {
  constructor(
    private readonly foodService: FoodService,
    private readonly recommendationService: RecommendationService,
  ) {}

  @Get('detail')
  @UseGuards(JwtLoginAuthGuard)
  async getFoodDetails(
    @Req() req: any,
    @Query('id') id: number,
  ): Promise<ResponseWrapper<any>> {
    const result = await this.foodService.getFoodById(req.user.id, id);
    if (!result) {
      return Promise.reject(
        new ResponseWrapper(
          HttpStatus.INTERNAL_SERVER_ERROR,
          'Failed to retrieve data',
        ),
      );
    }

    return new ResponseWrapper(
      HttpStatus.OK,
      'Food Data retrieved successfully',
      result,
    );
  }

  @Get('filter')
  @UseGuards(JwtLoginAuthGuard)
  async getPaginatedFoods(
    @Query('page') page: number = 1, // Default halaman 1
    @Query('limit') limit: number = 10, // Default limit 10
    @Query('name') name: string = '', // Default filter name adalah string kosong
    @Query('tags') tags: string = '', // Default filter tags adalah string kosong
  ): Promise<FoodResponseWrapper<any>> {
    // Convert tags query parameter menjadi array of numbers (jika ada)
    const tagsArray = tags ? tags.split(',').map(Number) : [];

    // Mengambil data makanan dengan pagination dan filter
    const result = await this.foodService.getFoods(
      page,
      limit,
      name,
      tagsArray,
    );
    if (!result) {
      return Promise.reject(
        new FoodResponseWrapper(
          HttpStatus.INTERNAL_SERVER_ERROR,
          'Failed to retrieve foods data',
        ),
      );
    }

    return new FoodResponseWrapper(
      HttpStatus.OK,
      'Foods Data retrieved successfully',
      result.data,
      result.total,
      result.page,
      result.limit,
      result.totalPages,
    );

    // return result;
  }

  @Post('save')
  @UseGuards(JwtLoginAuthGuard)
  async saveFood(
    @Req() req: any,
    @Body() eatFoodDto: EatFoodDTO,
  ): Promise<ResponseWrapper<any>> {
    try {
      // const savedFood = await this.foodService.saveFood(analyzeFoodSaveDto);

      const foodHistory = await this.foodService.addFoodHistory(
        req.user.id,
        eatFoodDto.food_id,
      );

      if (!foodHistory.id) {
        return Promise.reject(
          new ResponseWrapper(
            HttpStatus.INTERNAL_SERVER_ERROR,
            'Failed to save food',
          ),
        );
      }

      if (eatFoodDto.food_rate) {
        await this.foodService.setFoodRate(
          req.user.id,
          eatFoodDto.food_id,
          eatFoodDto.food_rate,
        );
      }

      return Promise.resolve(
        new ResponseWrapper(HttpStatus.CREATED, 'Food Saved Successfully'),
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @Post('analyze/save')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: multer.memoryStorage(),
    }),
  )
  @UseGuards(JwtLoginAuthGuard)
  async analyzeImageAndSave(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() analyzeFoodSaveDto: AnalyzeFoodSaveDto,
  ): Promise<ResponseWrapper<any>> {
    // console.log(analyzeFoodSaveDto);
    if (!file) {
      return Promise.reject(new ResponseWrapper(400, 'No file uploaded'));
    }
    try {
      const savedFood = await this.foodService.saveFood(analyzeFoodSaveDto);

      // console.log(savedFood.id);
      if (!savedFood.id) {
        return Promise.reject(
          new ResponseWrapper(
            HttpStatus.INTERNAL_SERVER_ERROR,
            'Failed to save food',
          ),
        );
      }

      const bucketName = process.env.SUPABASE_BUCKET_NAME;
      const filePath = `${savedFood.id}`;

      const { publicUrl } = await this.foodService.uploadFile(
        bucketName,
        filePath,
        file.buffer,
        file.mimetype,
      );
      // console.log(publicUrl);
      if (!publicUrl) {
        return Promise.reject(
          new ResponseWrapper(
            HttpStatus.INTERNAL_SERVER_ERROR,
            'Image Upload failed',
          ),
        );
      }

      const updatedFood = await this.foodService.updateFoodImage(
        savedFood.id,
        publicUrl,
      );

      if (!updatedFood) {
        return Promise.reject(
          new ResponseWrapper(
            HttpStatus.INTERNAL_SERVER_ERROR,
            'Failed to update food image',
          ),
        );
      }

      if (analyzeFoodSaveDto.food_rate) {
        await this.foodService.setFoodRate(
          req.user.id,
          savedFood.id,
          analyzeFoodSaveDto.food_rate,
        );
      }

      return Promise.resolve(
        new ResponseWrapper(HttpStatus.CREATED, 'Food Saved Successfully'),
      );
    } catch (error) {
      console.log(error);
    }
  }

  @Post('analyze')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: multer.memoryStorage(),
    }),
  )
  @UseGuards(JwtLoginAuthGuard)
  async analyzeImage(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ResponseWrapper<any>> {
    if (!file) {
      return Promise.reject(new ResponseWrapper(400, 'No file uploaded'));
    }
    try {
      const analyzeResult = await this.foodService.analyzeFoodNutrition(
        req.user.id,
      );
      if (!analyzeResult) {
        return Promise.reject(
          new ResponseWrapper(
            HttpStatus.INTERNAL_SERVER_ERROR,
            'Analyze Error',
          ),
        );
      }

      await this.foodService.addScanHistory(req.user.id);

      return Promise.resolve(
        new ResponseWrapper(
          HttpStatus.CREATED,
          'Food Analyze Successfully',
          analyzeResult,
        ),
      );
    } catch (error) {
      console.log(error);
      return Promise.reject(
        new ResponseWrapper(
          HttpStatus.INTERNAL_SERVER_ERROR,
          'An error occurred during file upload',
          error,
        ),
      );
    }
  }

  @Get('recommendation')
  @UseGuards(JwtLoginAuthGuard)
  async getRecommendation(@Req() req: any): Promise<ResponseWrapper<any>> {
    const recommendation = await this.recommendationService.getUserFoodHistory(
      req.user.id,
    );
    if (!recommendation) {
      return Promise.reject(
        new ResponseWrapper(
          HttpStatus.INTERNAL_SERVER_ERROR,
          'Failed to retrieve recommendation',
        ),
      );
    }

    return new ResponseWrapper(
      HttpStatus.OK,
      'Recommendation retrieved successfully',
      recommendation,
    );
  }

  // async parseImage(
  //   @UploadedFile() file: Express.Multer.File,
  // ): Promise<ResponseWrapper<any>> {
  //   if (!file) {
  //     return Promise.reject(new ResponseWrapper(400, 'No file uploaded'));
  //   }
  //   try {
  //     const bucketName = process.env.SUPABASE_BUCKET_NAME;

  //     const filePath = `${Date.now()}-${file.originalname}`;

  //     const uploadResponse = await this.foodService.uploadFile(
  //       bucketName,
  //       filePath,
  //       file.buffer,
  //       file.mimetype,
  //     );
  //     if (!uploadResponse) {
  //       return Promise.reject(
  //         new ResponseWrapper(
  //           HttpStatus.INTERNAL_SERVER_ERROR,
  //           'Upload failed',
  //         ),
  //       );
  //     }
  //     const dummyData = {
  //       rank: 'A',
  //       calories: 100,
  //       protein: 100,
  //       sugar: 100,
  //       fat: 50,
  //       carbo: 50,
  //       vitaminc: 50,
  //     };
  //     return Promise.resolve(
  //       // new ResponseWrapper(HttpStatus.CREATED, 'File uploaded successfully', {
  //       //   filePath: filePath,
  //       //   bucketName: bucketName,
  //       //   details: uploadResponse,
  //       // }),
  //       new ResponseWrapper(
  //         HttpStatus.CREATED,
  //         'Food Analyze Successfully',
  //         dummyData,
  //       ),
  //     );
  //   } catch (error) {
  //     return Promise.reject(
  //       new ResponseWrapper(
  //         HttpStatus.INTERNAL_SERVER_ERROR,
  //         'An error occurred during file upload',
  //         error,
  //       ),
  //     );
  //   }
  // }
}
