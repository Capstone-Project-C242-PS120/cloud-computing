import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Put,
  Req,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { RegisterUserDto } from '../dto/register-user.dto';
import { ResponseWrapper } from 'src/common/wrapper/response.wrapper';
import { JwtLoginAuthGuard } from 'src/auth/jwt/guards/jwt.guard';
import { JwtForgotAuthGuard } from 'src/auth/jwt/guards/jwt-forgot.guard';
import { UpdateUserDto } from '../dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('register')
  async registerUser(
    @Body() request: RegisterUserDto,
  ): Promise<ResponseWrapper<any>> {
    try {
      const user = await this.userService.createUser(request);
      if (user) {
        return new ResponseWrapper(HttpStatus.OK, 'Register Successful');
      }
    } catch (error) {
      // Mengembalikan error dalam format ResponseWrapper
      console.log(error);
      if (error instanceof UnprocessableEntityException) {
        return new ResponseWrapper(
          HttpStatus.UNPROCESSABLE_ENTITY,
          error.message,
        );
      }
      // Tangani jenis error lain jika diperlukan
      return new ResponseWrapper(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Registration failed',
      );
    }
  }

  @Get('jwtLogin')
  @UseGuards(JwtLoginAuthGuard)
  async tes() {
    return true;
  }
  @Get('jwtForgot')
  @UseGuards(JwtForgotAuthGuard)
  async forgot() {
    return true;
  }

  @Post('reset-password')
  @UseGuards(JwtForgotAuthGuard)
  async resetPassword(
    @Req() req: any,
    @Body() body: { newPassword: string },
  ): Promise<ResponseWrapper<any>> {
    await this.userService.resetPassword(req.user.id, body.newPassword);
    return new ResponseWrapper(HttpStatus.OK, 'Password Change Successful');
  }

  @Put('update')
  @UseGuards(JwtLoginAuthGuard)
  async updateUser(
    @Req() req: any,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<ResponseWrapper<any>> {
    await this.userService.updateUser(req.user.id, updateUserDto);
    return new ResponseWrapper(HttpStatus.OK, 'User updated successfully');
  }
}
