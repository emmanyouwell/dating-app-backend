import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { AuthService } from './auth.service';

/**
 * JWT payload structure
 */
interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request): string | null => {
          // Type guard for cookies
          const cookies = (
            request as unknown as { cookies?: Record<string, unknown> }
          ).cookies;
          const token =
            typeof cookies?.token === 'string' ? cookies.token : null;
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') ?? '',
    });
  }

  /**
   * Validate JWT payload
   */
  async validate(payload: JwtPayload) {
    this.logger.log(`Validating user: ${payload.sub}`);

    const user = await this.authService.validateUserById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found or unauthorized');
    }

    return user;
  }
}
