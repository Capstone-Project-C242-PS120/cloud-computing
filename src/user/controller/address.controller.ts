import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtLoginAuthGuard } from '../../auth/jwt/guards/jwt.guard';
import { AddressService } from '../services/address.service';
import { UpdateAddressDto } from '../dto/update-address.dto';

@Controller('user')
export class AddressController {
  constructor(private addressService: AddressService) {}

  @UseGuards(JwtLoginAuthGuard)
  @Put(':userId/address')
  async addOrUpdateAddress(
    @Param('userId') userId: string,
    @Body() updateAddressDto: UpdateAddressDto,
    @Req() req: any,
  ) {
    const authenticatedUserId = req.user.id;

    if (authenticatedUserId !== userId) {
      throw new ForbiddenException(
        "You are not allowed to update another user's address.",
      );
    }

    return this.addressService.addOrUpdateAddress(userId, updateAddressDto);
  }

  @UseGuards(JwtLoginAuthGuard)
  @Delete(':userId/address')
  async removeAddress(@Param('userId') userId: string, @Req() req: any) {
    const authenticatedUserId = req.user.id;

    if (authenticatedUserId !== userId) {
      throw new ForbiddenException(
        "You are not allowed to remove another user's address.",
      );
    }

    return this.addressService.removeAddress(userId);
  }
}
