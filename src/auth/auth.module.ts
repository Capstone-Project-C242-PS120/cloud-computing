import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from 'src/user/user.module';
import { JwtLoginModule } from './jwt/module/jwt.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entity/user.entity';
import { AuthController } from './controller/auth.controller';
import { AuthService } from './services/auth.service';
import { OtpService } from './services/otp.service';
import { LocalStrategy } from './jwt/strategies/local.strategy';
import { JwtLoginStrategy } from './jwt/strategies/jwt.strategy';
import { GoogleStrategy } from './google/google.strategy';
import { Otp } from './entity/otp.entity';
import { JwtForgotModule } from './jwt/module/jwt-forgot.module';
import { JwtForgotStrategy } from './jwt/strategies/jwt-forgot.strategy';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt', session: false }),
    UserModule,
    JwtLoginModule,
    JwtForgotModule,
    TypeOrmModule.forFeature([User, Otp]),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: 'AUTH_SERVICE',
      useClass: AuthService,
    },
    OtpService,
    LocalStrategy,
    JwtLoginStrategy,
    JwtForgotStrategy,
    GoogleStrategy,
  ],
  exports: [AuthModule],
})
export class AuthModule {}
