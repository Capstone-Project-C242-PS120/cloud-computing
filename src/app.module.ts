import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entity/user.entity';
import { Otp } from './auth/entity/otp.entity';
import { FoodHistory } from './food/entity/food-history.entity';
import { Food } from './food/entity/food.entity';
import { FoodGroup } from './food/entity/food-group.entity';
import { FoodRate } from './food/entity/food-rate.entity';
import { ScanHistory } from './food/entity/scan-history.entity';
import { PointHistory } from './point/entity/point-history.entity';
import { Gift } from './point/entity/gift.entity';
import { AuthModule } from './auth/auth.module';
import { FoodModule } from './food/food.module';
import { PointModule } from './point/point.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import * as path from 'path';
import { Connector, IpAddressTypes } from '@google-cloud/cloud-sql-connector';
import { Pool } from 'pg';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const isUsingUnixSocket = configService.get<string>('USE_UNIX_SOCKET'); // Flag untuk memilih Unix socket
        const socketPath = `/cloudsql/${configService.get<string>('INSTANCE_CONNECTION_NAME')}`;

        console.log('isUsingUnixSocket:', isUsingUnixSocket);
        console.log('Socket Path:', socketPath);

        // Menggunakan cloud-sql-connector untuk menghubungkan ke PostgreSQL

        const connector = new Connector();
        const clientOpts = await connector.getOptions({
          instanceConnectionName: process.env.INSTANCE_CONNECTION_NAME,
          ipType: IpAddressTypes.PSC,
        });
        const pool = new Pool({
          ...clientOpts,
          user: configService.get<string>('DATABASE_USERNAME'),
          database: configService.get<string>('DATABASE_NAME'),
        });

        // Menguji koneksi pertama kali
        await pool.connect().catch((err) => {
          console.error('Database connection error:', err);
          throw err;
        });

        console.log('Connected to the database successfully');

        return {
          type: 'postgres',
          host:
            isUsingUnixSocket === 'true'
              ? undefined
              : configService.get<string>('DATABASE_HOST'),
          port:
            isUsingUnixSocket === 'true'
              ? undefined
              : configService.get<number>('DATABASE_PORT'),
          extra: isUsingUnixSocket === 'true' ? { socketPath } : undefined,
          username: configService.get<string>('DATABASE_USERNAME'),
          password: configService.get<string>('DATABASE_PASSWORD'),
          database: configService.get<string>('DATABASE_NAME'),
          entities: [
            User,
            Otp,
            FoodHistory,
            Food,
            FoodGroup,
            FoodRate,
            ScanHistory,
            PointHistory,
            Gift,
          ],
          synchronize: true, // Sesuaikan dengan kebutuhan Anda
        };
      },
      inject: [ConfigService],
    }),

    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          service: configService.get<string>('SMTP_SERVICE'),
          host: configService.get<string>('SMTP_HOST'),
          port: configService.get<number>('SMTP_PORT'),
          secure: configService.get<boolean>('SMTP_SECURE'),
          auth: {
            user: configService.get<string>('SMTP_USER'),
            pass: configService.get<string>('SMTP_PASS'),
          },
          debug: true,
        },
        defaults: {
          from: configService.get<string>('DEFAULT_FROM'),
        },
        template: {
          dir: path.join(__dirname, '../src/auth/templates'),
          adapter: new PugAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),

    AuthModule,
    FoodModule,
    PointModule,
  ],
})
export class AppModule {}
