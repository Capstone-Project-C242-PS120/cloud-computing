import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ProductModule } from './product/product.module';
import { PointModule } from './point/point.module';
import { OrderModule } from './order/order.module';

@Module({
  imports: [
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
