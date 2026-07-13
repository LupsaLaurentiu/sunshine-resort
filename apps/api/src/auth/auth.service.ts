import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AdminsService } from '../admins/admins.service';
import { LoginDto } from './dto/login.dto';

type LoginResponse = {
  accessToken: string;
  admin: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
};

@Injectable()
export class AuthService {
  constructor(
    private readonly adminsService: AdminsService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<LoginResponse> {
    const admin = await this.adminsService.findByEmail(dto.email);

    if (!admin || !admin.isActive) {
      throw new UnauthorizedException('Email sau parolă incorectă.');
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      admin.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Email sau parolă incorectă.');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: admin.id,
      email: admin.email,
    });

    await this.adminsService.updateLastLogin(admin.id);

    return {
      accessToken,
      admin: {
        id: admin.id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
      },
    };
  }
}