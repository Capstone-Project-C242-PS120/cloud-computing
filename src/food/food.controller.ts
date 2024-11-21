import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';

import { FoodService } from './food.service';
import { ResponseWrapper } from 'src/common/wrapper/response.wrapper';

@Controller('food')
export class FoodController {
  constructor(private readonly foodService: FoodService) {}

  @Post('analyze')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: multer.memoryStorage(),
    }),
  )
  async parseImage(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ResponseWrapper<any>> {
    if (!file) {
      return Promise.reject(new ResponseWrapper(400, 'No file uploaded'));
    }
    try {
      const bucketName = process.env.SUPABASE_BUCKET_NAME;

      const filePath = `${Date.now()}-${file.originalname}`;

      const uploadResponse = await this.foodService.uploadFile(
        bucketName,
        filePath,
        file.buffer,
        file.mimetype,
      );
      if (!uploadResponse) {
        return Promise.reject(
          new ResponseWrapper(
            HttpStatus.INTERNAL_SERVER_ERROR,
            'Upload failed',
          ),
        );
      }
      const dummyData = {
        rank: 'A',
        calories: 100,
        protein: 100,
        sugar: 100,
        fat: 50,
        carbo: 50,
        vitaminc: 50,
      };
      return Promise.resolve(
        // new ResponseWrapper(HttpStatus.CREATED, 'File uploaded successfully', {
        //   filePath: filePath,
        //   bucketName: bucketName,
        //   details: uploadResponse,
        // }),
        new ResponseWrapper(
          HttpStatus.CREATED,
          'File Analyze Successfully',
          dummyData,
        ),
      );
    } catch (error) {
      return Promise.reject(
        new ResponseWrapper(
          HttpStatus.INTERNAL_SERVER_ERROR,
          'An error occurred during file upload',
          error,
        ),
      );
    }
  }
}
