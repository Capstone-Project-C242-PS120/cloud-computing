import { Injectable, OnModuleInit } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import { SecretManagerService } from './secret-manager.service';

@Injectable()
export class StorageService implements OnModuleInit {
  private storage: Storage;

  constructor(private readonly secretManagerService: SecretManagerService) {}
  async onModuleInit() {
    this.initStorage();
  }

  async initStorage() {
    const isLocal = process.env.NODE_ENV !== 'production';

    if (isLocal) {
      // Ambil kredensial dari Secret Manager di lokal
      const storageKeyJson = await this.secretManagerService.getSecret(
        process.env.GCP_STORAGE_SECRET_NAME,
      );
      this.storage = new Storage({
        credentials: JSON.parse(storageKeyJson),
        projectId: process.env.GCP_PROJECT_ID,
      });
    } else {
      // Gunakan ADC di produksi
      this.storage = new Storage();
    }
  }

  async uploadFile(
    bucketName: string,
    fileName: string,
    fileBuffer: Buffer,
  ): Promise<string> {
    const bucket = this.storage.bucket(bucketName);
    const file = bucket.file(fileName);

    await file.save(fileBuffer);
    return `https://storage.googleapis.com/${bucketName}/${fileName}`;
  }
}
