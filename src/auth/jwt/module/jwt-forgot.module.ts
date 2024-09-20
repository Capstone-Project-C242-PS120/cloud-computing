import { JwtModule, JwtService } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('FORGOT_PASSWORD_JWT_SECRET'), // Ganti defaultSecret dengan secret yang aman
        signOptions: {
          expiresIn: configService.get<string>('FORGOT_PASSWORD_JWT_EXP'), // Ganti 60s dengan waktu kedaluwarsa yang sesuai
        },
      }),
    }),
  ],
  providers: [
    {
      provide: 'JwtForgotService',
      useExisting: JwtService,
    },
  ],
  exports: ['JwtForgotService'], // Ekspor JwtModule untuk digunakan oleh modul lain
})
export class JwtForgotModule {}
