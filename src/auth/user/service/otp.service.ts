import { Injectable } from '@nestjs/common';
import { Otp } from '../entity/otp.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { User } from '../entity/user.entity';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(Otp) private readonly otpRepository: Repository<Otp>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async generateOtp(userId: string): Promise<Otp> {
    // Generate random 6-digit OTP code
    const otp = crypto.randomInt(100000, 999999).toString();
    console.log(otp);
    const expiryDate = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes

    const otpDb = this.otpRepository.create({
      otp: await bcrypt.hash(otp, 10),
      users: await this.userRepository.findOneBy({ id: userId }),
      expiresAt: expiryDate,
    });

    return this.otpRepository.save(otpDb);
  }
  async validateOtp(userId: string, otpCode: string): Promise<boolean> {
    const otp = await this.otpRepository.findOne({
      where: { users: { id: userId } },
    });

    const isMatch = await bcrypt.compare(otpCode, otp.otp);
    if (!isMatch) throw new Error('Invalid OTP');

    if (!otp || new Date() > otp.expiresAt) {
      throw new Error('Invalid or expired OTP');
    }

    // If OTP is valid, update user's isVerified status
    await this.userRepository.update(userId, { isVerified: true });

    // Remove the OTP after successful verification
    await this.otpRepository.delete(otp.id);
    return true;
  }
}
