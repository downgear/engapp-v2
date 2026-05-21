import { Controller, Post, Body, Get, Query, UseGuards, Request, Ip, Headers, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  login(
    @Body() loginDto: LoginDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.authService.login(loginDto, { ipAddress: ip, userAgent });
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req) {
    return this.authService.getProfile(req.user.userId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Request() req) {
    return req.user;
  }

  @Get('profile-by-email')
  getProfileByEmail(@Query('email') email: string) {
    return this.authService.getProfileByEmail(email);
  }

  @Post('ensure-profile')
  async ensureProfile(
    @Headers('authorization') authHeader: string,
    @Body() body: { email: string; fullName?: string; role?: string },
  ) {
    const token = authHeader?.replace('Bearer ', '');
    if (!token) throw new UnauthorizedException('No token provided');

    let payload: { sub: string };
    try {
      payload = this.authService.verifyToken(token);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }

    return this.authService.ensureProfile(payload.sub, {
      email: body.email,
      fullName: body.fullName,
      role: body.role as any,
    });
  }
}

