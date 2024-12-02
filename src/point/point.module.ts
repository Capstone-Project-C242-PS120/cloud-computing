import { Module } from '@nestjs/common';
import { PointService } from './point.service';
import { PointController } from './point.controller';
import { JwtLoginModule } from 'src/auth/jwt/module/jwt.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entity/user.entity';
import { PointHistory } from './entity/point-history.entity';
import { Gift } from './entity/gift.entity';

@Module({
  imports: [
    JwtLoginModule,
    TypeOrmModule.forFeature([User, PointHistory, Gift]),
  ],
  providers: [PointService],
  controllers: [PointController],
})
export class PointModule {}
