import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthPayloadDto } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user/entity/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser({ email, password }: AuthPayloadDto): Promise<string> {
    // Cari user berdasarkan email
    const findUser = await this.userRepository.findOne({
      where: { email },
    });

    // Jika user tidak ditemukan
    if (!findUser) {
      throw new UnauthorizedException('User not found');
    }

    // Bandingkan password menggunakan bcrypt
    const isPasswordValid = await bcrypt.compare(password, findUser.password);

    // Jika password tidak cocok
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Hilangkan password dari objek yang dikirim ke token
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = findUser;

    // Generate dan kembalikan token JWT
    return this.jwtService.sign(userWithoutPassword);
  }
}
