import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entity/user.entity';
import { Repository } from 'typeorm';
import { Address } from '../entity/address.entity';
import { UpdatePhoneNumberDto } from '../dto/update_phone.dto';

@Injectable()
export class PhoneService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) {}
  // Add or update phone number
  async addOrUpdatePhoneNumber(
    userId: string,
    updatePhoneNumberDto: UpdatePhoneNumberDto,
  ): Promise<{ message: string; phoneNumber: string }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    user.phoneNumber = updatePhoneNumberDto.phoneNumber;
    await this.userRepository.save(user);

    return {
      message: 'Phone number successfully updated.',
      phoneNumber: user.phoneNumber,
    };
  }

  // Remove phone number
  async removePhoneNumber(userId: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    user.phoneNumber = null;
    await this.userRepository.save(user);

    return { message: 'Phone number successfully removed.' };
  }
}
