import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { validateOrReject } from 'class-validator';
import { AuthService } from 'src/auth/services/auth.service';
import { LoginAuthDto } from 'src/auth/dto/login-auth.dto';

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
    const authDto = new LoginAuthDto();
    authDto.email = email;
    authDto.password = password;

    try {
      await validateOrReject(authDto);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (errors) {
      throw new BadRequestException();
    }
    try {
      const access_token = await this.authService.validateUser({
        email,
        password,
      });
      return access_token;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw InternalServerErrorException;
    }
  }
}
