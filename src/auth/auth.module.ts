import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Address } from './user/entity/address.entity';
import { User } from './user/entity/user.entity';
import { UserModule } from './user/user.module';
import { GoogleStrategy } from './google/google.strategy';
import { Otp } from './user/entity/otp.entity';
import { OtpService } from './user/service/otp.service';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt', session: false }),
    UserModule,
    JwtModule.registerAsync({
      imports: [ConfigModule], // Impor ConfigModule untuk akses ke ConfigService
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXP'),
        },
      }),
    }),
    TypeOrmModule.forFeature([User, Address, Otp]),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: 'AUTH_SERVICE',
      useClass: AuthService,
    },
    OtpService,
    LocalStrategy,
    JwtStrategy,
    GoogleStrategy,
  ],
  exports: [JwtModule, PassportModule],
})
export class AuthModule {}
