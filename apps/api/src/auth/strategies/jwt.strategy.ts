import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AdminsService } from '../../admins/admins.service';

export type JwtPayload = {
  sub: string;
  email: string;
};

export type AuthenticatedAdmin = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly adminsService: AdminsService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');

    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured.');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedAdmin> {
    const admin = await this.adminsService.findById(payload.sub);

    if (!admin || !admin.isActive) {
      throw new UnauthorizedException(
        'Administrator invalid sau inactiv.',
      );
    }

    return {
      id: admin.id,
      email: admin.email,
      firstName: admin.firstName,
      lastName: admin.lastName,
    };
  }
}