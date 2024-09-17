import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthPayloadDto } from '../dto/auth.dto';
import { validateOrReject } from 'class-validator';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: AuthService,
  ) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string) {
    // console.log('Inside LocalStrategy');

    const authDto = new AuthPayloadDto();
    authDto.email = email;
    authDto.password = password;

    try {
      // Validate the DTO
      await validateOrReject(authDto);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (errors) {
      throw new BadRequestException('Validation failed');
    }

    const user = this.authService.validateUser({ email, password });
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
