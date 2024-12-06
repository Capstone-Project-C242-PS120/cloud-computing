import { Injectable } from '@nestjs/common';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

@Injectable()
export class SecretManagerService {
  private client: SecretManagerServiceClient;

  constructor() {
    const isLocal = process.env.NODE_ENV !== 'production';


    this.client = isLocal
      ? new SecretManagerServiceClient({
          keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        })
      : new SecretManagerServiceClient();
  }

  async getSecret(secretName: string): Promise<string> {
    try {
      const [version] = await this.client.accessSecretVersion({
        name: `projects/${process.env.GCP_PROJECT_ID}/secrets/${secretName}/versions/latest`,
      });

      const payload = version.payload?.data?.toString();
      if (!payload) {
        throw new Error(`Secret ${secretName} is empty or not found.`);
      }
      return payload;
    } catch (error) {
      console.error(`Error accessing secret ${secretName}:`, error.message);
      throw new Error(`Failed to access secret: ${secretName}`);
    }
  }
}
