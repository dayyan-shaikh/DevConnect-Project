import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../schemas/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET') || 'supersecretkey',
      ignoreExpiration: false,
    });
  }

  async validate(payload: any) {
    try {
      const userId = payload.sub;
      const user = await this.userModel.findOne({ user_id: userId }).lean().exec();
      
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      
      return { 
        userId: user.user_id,
        email: user.email,
        name: user.name
      };
    } catch (error) {
      if (!(error instanceof UnauthorizedException)) {
        throw new UnauthorizedException('Authentication failed');
      }
      throw error;
    }
  }
}
