import { Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { PointService } from '../services/point.service';
import { JwtLoginAuthGuard } from 'src/auth/jwt/guards/jwt.guard';
import { ResponseWrapper } from 'src/common/wrapper/response.wrapper';

@Controller('point')
export class PointController {
  constructor(private readonly pointService: PointService) {}

  @Get('gifts')
  @UseGuards(JwtLoginAuthGuard)
  async getGifts(): Promise<ResponseWrapper<any>> {
    const gifts = await this.pointService.getGiftsList();
    return new ResponseWrapper(200, 'Gifts retrieved successfully', gifts);
  }

  @Post('redeem')
  @UseGuards(JwtLoginAuthGuard)
  async redeemGift(
    @Req() req: any,
    @Query('gift_id') giftId: number,
  ): Promise<ResponseWrapper<any>> {
    try {
      const result = await this.pointService.redeemGifts(
        req.user.id,
        giftId.toString(),
      );
      return new ResponseWrapper(200, 'Gift redeemed successfully', result);
    } catch (error) {
      return new ResponseWrapper(500, error.message);
    }
  }
}
