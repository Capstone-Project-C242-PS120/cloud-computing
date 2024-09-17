import { Module } from '@nestjs/common';
import { UserController } from './controller/user.controller';
import { UserService } from './service/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Address } from './entity/address.entity';

import { JwtStrategy } from '../strategies/jwt.strategy';
import { PhoneService } from './service/phone.service';
import { AddressService } from './service/address.service';
import { PhoneController } from './controller/phone.controller';
import { AddressController } from './controller/address.controller';
import { Otp } from './entity/otp.entity';
import { OtpService } from './service/otp.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([User, Address, Otp])],
  controllers: [UserController, PhoneController, AddressController],
  providers: [
    UserService,
    JwtStrategy,
    PhoneService,
    AddressService,
    OtpService,
    JwtService,
  ],
  exports: [UserService],
})
export class UserModule {}
