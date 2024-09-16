import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ProductModule } from './product/product.module';
import { PointModule } from './point/point.module';
import { OrderModule } from './order/order.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './auth/user/entity/user.entity';
import { Address } from './auth/user/entity/address.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'ramadhanial-qadri',
      password: '',
      database: 'fleura',
      entities: [User, Address],
      synchronize: true,
    }),
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true, // Membuat konfigurasi tersedia di seluruh modul
    }),
    ProductModule,
    PointModule,
    OrderModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
