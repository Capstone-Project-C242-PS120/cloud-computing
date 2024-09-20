import { Module } from '@nestjs/common';
import { UserController } from './controller/user.controller';
import { UserService } from './services/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Address } from './entity/address.entity';
import { JwtLoginStrategy } from '../auth/jwt/strategies/jwt.strategy';
import { AddressService } from './services/address.service';
import { AddressController } from './controller/address.controller';

import { ConfigModule } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { Otp } from 'src/auth/entity/otp.entity';
import { JwtLoginModule } from 'src/auth/jwt/module/jwt.module';
import { OtpService } from 'src/auth/services/otp.service';
import { JwtForgotStrategy } from 'src/auth/jwt/strategies/jwt-forgot.strategy';
import { JwtForgotModule } from 'src/auth/jwt/module/jwt-forgot.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User, Address, Otp]),
    MailerModule,
    JwtLoginModule,
    JwtForgotModule,
  ],
  controllers: [UserController, AddressController],
  providers: [
    UserService,
    JwtLoginStrategy,
    JwtForgotStrategy,
    AddressService,
    OtpService,
  ],
  exports: [UserService],
})
export class UserModule {}
