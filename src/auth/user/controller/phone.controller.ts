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
import { UpdatePhoneNumberDto } from '../dto/update_phone.dto';
import { PhoneService } from '../service/phone.service';

@Controller('user')
export class PhoneController {
  constructor(private phoneService: PhoneService) {}

  @UseGuards(JwtAuthGuard)
  @Put(':userId/phone')
  async addOrUpdatePhoneNumber(
    @Param('userId') userId: string,
    @Body() updatePhoneNumberDto: UpdatePhoneNumberDto,
    @Req() req: any,
  ) {
    const authenticatedUserId = req.user.id;

    if (authenticatedUserId !== userId) {
      throw new ForbiddenException(
        "You are not allowed to update another user's phone number.",
      );
    }

    return this.phoneService.addOrUpdatePhoneNumber(
      userId,
      updatePhoneNumberDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':userId/phone')
  async removePhoneNumber(@Param('userId') userId: string, @Req() req: any) {
    const authenticatedUserId = req.user.id;

    if (authenticatedUserId !== userId) {
      throw new ForbiddenException(
        "You are not allowed to remove another user's phone number.",
      );
    }

    return this.phoneService.removePhoneNumber(userId);
  }
}
