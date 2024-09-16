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
import { JwtAuthGuard } from '../../guards/jwt.guard';
import { UpdateAddressDto } from '../dto/update_address.dto';
import { AddressService } from '../service/address.service';

@Controller('user')
export class AddressController {
  constructor(private addressService: AddressService) {}

  @UseGuards(JwtAuthGuard)
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

  @UseGuards(JwtAuthGuard)
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
