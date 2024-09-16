import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entity/user.entity';
import { Repository } from 'typeorm';
import { Address } from '../entity/address.entity';
import { UpdateAddressDto } from '../dto/update_address.dto';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) {}
  // Add or update address
  async addOrUpdateAddress(
    userId: string,
    updateAddressDto: UpdateAddressDto,
  ): Promise<{ message: string; address: UpdateAddressDto }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['address'],
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    let address = user.address;
    if (!address) {
      address = this.addressRepository.create(updateAddressDto);
      await this.addressRepository.save(address);
      user.address = address;
    } else {
      Object.assign(address, updateAddressDto);
      await this.addressRepository.save(address);
    }

    await this.userRepository.save(user);

    return {
      message: 'Address successfully updated.',
      address: {
        street: address.street,
        city: address.city,
        postalCode: address.postalCode,
      },
    };
  }

  // Remove address
  async removeAddress(userId: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['address'],
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    if (user.address) {
      await this.addressRepository.remove(user.address);
      user.address = null;
    }

    await this.userRepository.save(user);

    return { message: 'Address successfully removed.' };
  }
}
