import { Injectable } from '@nestjs/common';
import { Gift } from '../entity/gift.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PointHistory } from '../entity/point-history.entity';
import { User } from 'src/user/entity/user.entity';

@Injectable()
export class PointService {
  constructor(
    @InjectRepository(Gift)
    private giftRepository: Repository<Gift>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(PointHistory)
    private pointHistoryRepository: Repository<PointHistory>,
  ) {}

  async getGiftsList(): Promise<Gift[]> {
    return await this.giftRepository.find();
  }
  async redeemGifts(userId: string, giftId: string): Promise<any> {
    const gift = await this.giftRepository.findOne({ where: { id: giftId } });
    if (!gift) {
      throw new Error('Gift not found');
    }

    const userPoint = await this.getUserPoint(userId);
    if (userPoint < gift.point) {
      throw new Error('Insufficient point');
    }

    await this.updateUserPoint(userId, -gift.point);
    await this.addPointHistory(userId, -gift.point, `Redeem gift ${gift.name}`);

    return { message: 'Gift redeemed successfully' };
  }

  async addPointHistory(
    userId: string,
    point: number,
    description: string,
  ): Promise<void> {
    const pointHistory = this.pointHistoryRepository.create({
      user: { id: userId },
      point,
      description,
    });

    await this.pointHistoryRepository.save(pointHistory);
  }
  async updateUserPoint(userId: string, point: number): Promise<void> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      user.point += point;
      await this.userRepository.save(user);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new Error('Failed to update user point');
    }
  }
  async getUserPoint(userId: string): Promise<number> {
    const userPoint = await this.userRepository.findOne({
      where: { id: userId },
      select: ['point'],
    });

    return userPoint.point;
  }
}
