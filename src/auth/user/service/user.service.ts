import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { RegisterUserDto } from '../dto/register_user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entity/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Address } from '../entity/address.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) {}

  async createUser(request: RegisterUserDto): Promise<User> {
    // Validasi request sebelum membuat user
    await this.validateCreateUserRequest(request);

    // Membuat instance user baru
    const user = this.userRepository.create({
      ...request,
      password: await bcrypt.hash(request.password, 10),
    });

    // Simpan user ke database
    await this.userRepository.save(user);

    // Jangan return password dalam response
    delete user.password;

    // Kembalikan user yang baru dibuat (tanpa password)
    return user;
  }

  async getUserByEmail(email: string): Promise<User> {
    // Cari user berdasarkan email
    const user = await this.userRepository.findOne({
      where: { email },
    });

    // Jika user tidak ditemukan
    if (!user) {
      throw new UnprocessableEntityException('User not found.');
    }

    // Pisahkan password sebelum mengembalikan user
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;

    // Kembalikan user tanpa password
    return userWithoutPassword as User;
  }

  private async validateCreateUserRequest(request: RegisterUserDto) {
    let user: User;

    try {
      user = await this.userRepository.findOne({
        where: { email: request.email },
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      // Log error jika perlu
    }

    if (user) {
      throw new UnprocessableEntityException('Email already exists.');
    }
  }
}
