import { Injectable } from '@nestjs/common';
import { GoogleClient } from './client/google.client';
import { NaverClient } from './client/naver.client';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly googleClient: GoogleClient,
    private readonly naverClient: NaverClient,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async googleLogin(code: string) {
    const accessToken = await this.googleClient.getToken(code);
    const userInfo = await this.googleClient.getUserInfo(accessToken);
    
    let user = await this.userService.findBySocialId(userInfo.socialId);
    if (!user) {
      user = await this.userService.create(userInfo);
    }

    return this.generateToken(user);
  }

  async naverLogin(code: string, state: string) {
    const accessToken = await this.naverClient.getToken(code, state);
    const userInfo = await this.naverClient.getUserInfo(accessToken);
    
    let user = await this.userService.findBySocialId(userInfo.socialId);
    if (!user) {
      user = await this.userService.create(userInfo);
    }

    return this.generateToken(user);
  }

  generateToken(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };
    return this.jwtService.sign(payload);
  }
}
