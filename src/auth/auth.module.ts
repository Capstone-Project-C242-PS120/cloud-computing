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

@Module({
  imports: [
    ConfigModule,
    PassportModule,
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
    TypeOrmModule.forFeature([User, Address]),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [JwtModule, PassportModule],
})
export class AuthModule {}
