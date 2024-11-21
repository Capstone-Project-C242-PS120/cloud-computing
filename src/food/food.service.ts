import { Injectable } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

@Injectable()
export class FoodService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async uploadFile(
    bucketName: string,
    filePath: string,
    file: Buffer,
    mimeType: string,
  ): Promise<any> {
    const supabase = this.supabaseService.getSupabaseClient();

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        contentType: mimeType,
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    return data;
  }

  //   async getPublicUrl(bucketName: string, filePath: string): Promise<string> {
  //     const supabase = this.supabaseService.getSupabaseClient();

  //     const { publicUrl } = supabase.storage
  //       .from(bucketName)
  //       .getPublicUrl(filePath);

  //     return publicUrl;
  //   }
}
