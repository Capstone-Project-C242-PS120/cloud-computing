import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request } from 'express';
import { LocalGuard } from './guards/local.guard';
import { JwtAuthGuard } from './guards/jwt.guard';
import { GoogleAuthGuard } from './google/google.guard';
import { OtpService } from './user/service/otp.service';

@Controller('auth')
export class AuthController {
  jwtService: any;
  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: AuthService,
    private otpService: OtpService,
  ) {}

  @Post('login')
  @UseGuards(LocalGuard)
  login(@Req() req: Request) {
    return req.user;
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  status(@Req() req: Request) {
    return req.user;
  }

  @Get('google/login')
  @UseGuards(GoogleAuthGuard)
  handleLogin() {
    return { msg: 'Google Authentication' };
  }

  @Get('google/redirect')
  @UseGuards(GoogleAuthGuard)
  handleRedirect(@Req() req) {
    // After successful authentication, Google redirects to this route
    const jwt = req.user.jwt;
    return { message: 'User information from Google', token: jwt };
  }

  @Post('otp/verify')
  @UseGuards(JwtAuthGuard) // JWT Guard to ensure the user is authenticated
  async verifyOtp(
    @Req() req, // Get user from JWT token
    @Body() body: { otpCode: string },
  ) {
    const userId = req.user.id;
    console.log(userId); // Get the user ID from the JWT payload

    const isValid = await this.otpService.validateOtp(userId, body.otpCode);
    if (!isValid) {
      throw new HttpException('Invalid OTP', HttpStatus.BAD_REQUEST);
    }

    return { message: 'OTP verified successfully. User is now verified.' };
  }
}
