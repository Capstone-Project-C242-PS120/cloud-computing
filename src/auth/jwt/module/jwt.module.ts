import { JwtModule, JwtService } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXP'),
        },
      }),
    }),
  ],
  providers: [
    {
      provide: 'JwtLoginService',
      useExisting: JwtService,
    },
  ],
  exports: ['JwtLoginService'], // Ekspor JwtModule untuk digunakan oleh modul lain
})
export class JwtLoginModule {}
