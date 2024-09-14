import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthPayloadDto } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';

const fakeUsers = [
  {
    id: 1,
    username: 'anson',
    email: 'anson@gmail.com',
    password: 'password',
  },
  {
    id: 2,
    username: 'anton',
    email: 'anton@gmail.com',
    password: 'password',
  },
];

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async validateUser({ email, password }: AuthPayloadDto): Promise<string> {
    const findUser = fakeUsers.find((user) => user.email === email);

    if (!findUser) {
      throw new UnauthorizedException('User not found');
    }

    if (password !== findUser.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...user } = findUser;
    return this.jwtService.sign(user);
  }
}
