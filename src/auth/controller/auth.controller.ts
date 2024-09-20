import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LocalGuard } from '../jwt/guards/local.guard';
import { GoogleAuthGuard } from '../google/google.guard';
import { OtpService } from '../services/otp.service';
import { AuthService } from '../services/auth.service';
import { Request } from 'express';
import { ResponseWrapper } from 'src/common/wrapper/response.wrapper';

@Controller('auth')
export class AuthController {
  jwtService: any;
  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: AuthService,
    private otpService: OtpService,
  ) {}

  @Post('login')
  @UseGuards(LocalGuard)
  async login(@Req() req: Request): Promise<ResponseWrapper<any>> {
    const access_token = req.user;
    return new ResponseWrapper(HttpStatus.OK, 'Login Successful', {
      access_token,
    });
  }

  @Get('google/login')
  @UseGuards(GoogleAuthGuard)
  handleLogin() {
    return { msg: 'Google Authentication' };
  }

  @Post('otp/forgot')
  async verifyOtpForgot(
    @Body() body: { otpCode: string; email: string },
  ): Promise<ResponseWrapper<any>> {
    const access_token = await this.otpService.verifyOtpForgot(
      body.otpCode,
      body.email,
    );
    return new ResponseWrapper(
      HttpStatus.OK,
      'OTP has been generated successfully.',
      {
        access_token,
      },
    );
  }

  @Get('google/redirect')
  @UseGuards(GoogleAuthGuard)
  async handleRedirect(@Req() req): Promise<ResponseWrapper<any>> {
    // After successful authentication, Google redirects to this route
    const access_token = req.user;
    return new ResponseWrapper(HttpStatus.OK, 'Login Successful', {
      access_token,
    });
  }

  @Post('otp/verify')
  async verifyOtp(
    @Body() body: { otpCode: string; email: string },
  ): Promise<ResponseWrapper<any>> {
    const isValid = await this.otpService.validateOtpVerification(
      body.otpCode,
      body.email,
    );
    if (isValid) {
      return new ResponseWrapper(
        HttpStatus.OK,
        'OTP verified successfully. User is now verified.',
      );
    }
  }
  @Post('otp/generate')
  async regenerateOtp(@Body() body: { email: string }) {
    const otp = await this.otpService.generateOtp(body.email);
    if (otp) {
      return new ResponseWrapper(
        HttpStatus.OK,
        'OTP has been generated successfully.',
      );
    }
  }
}
