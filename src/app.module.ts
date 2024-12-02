import { Module } from '@nestjs/common';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entity/user.entity';
import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import * as path from 'path';
import { Otp } from './auth/entity/otp.entity';
import { AuthModule } from './auth/auth.module';

import { FoodModule } from './food/food.module';
import { FoodHistory } from './food/entity/food-history.entity';
import { Food } from './food/entity/food.entity';
import { FoodGroup } from './food/entity/food-group.entity';
import { FoodRate } from './food/entity/food-rate.entity';
import { ScanHistory } from './food/entity/scan-history.entity';
import { PointModule } from './point/point.module';
import { SubscriptionController } from './subscription/subscription.controller';
import { SubscriptionService } from './subscription/subscription.service';
import { SubscriptionModule } from './subscription/subscription.module';
import { PointHistory } from './point/entity/point-history.entity';
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: configService.get<'postgres'>('DATABASE_TYPE'),
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
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
        ],
        synchronize: true,
      }),
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
          dir: path.join(__dirname, '../src/auth/templates'), // Sesuaikan dengan lokasi template kamu
          adapter: new PugAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true, // Membuat konfigurasi tersedia di seluruh modul
    }),
    FoodModule,
    PointModule,
    SubscriptionModule,
  ],
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
  // controllers: [FoodController],
  // providers: [FoodService],
})
export class AppModule {}
