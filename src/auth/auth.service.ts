import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthPayloadDto } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user/entity/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { GoogleUserDetails } from './dto/google.dto';

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
  async validateGoogleUser(
    details: GoogleUserDetails,
  ): Promise<{ access_token: string }> {
    try {
      let user = await this.userRepository.findOneBy({ email: details.email });

      if (user) {
        // Set verified to true if the user is found
        user.isVerified = true;
        await this.userRepository.save(user);
        console.log('User found and verified:', user.email);
      } else {
        // If user not found, create a new user and set verified to true
        console.log('User not found. Creating new user...');
        user = this.userRepository.create({
          email: details.email,
          name: details.name,
          isVerified: true, // Mark user as verified
          // Add any other fields you need from details
        });

        // Save the new user
        user = await this.userRepository.save(user);
        console.log('New user created and verified:', user.email);
      }

      // Destructure user to exclude password
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = user;

      // Generate JWT token with all user data (except password)
      const access_token = this.jwtService.sign(userWithoutPassword);

      // Return the JWT token
      return { access_token };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new Error('Failed to validate Google user');
    }
  }
}
