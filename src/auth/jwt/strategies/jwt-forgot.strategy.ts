import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtForgotStrategy extends PassportStrategy(Strategy, 'forgot') {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('FORGOT_PASSWORD_JWT_SECRET'),
    });
  }

  validate(payload: any) {
    // console.log('Inside JWT Strategy Validate');
    // console.log(payload);
    return payload;
  }
}
