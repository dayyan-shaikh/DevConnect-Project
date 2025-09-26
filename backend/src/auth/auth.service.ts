import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../auth/schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ProfileService } from '../profile/profile.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private readonly profileService: ProfileService,
  ) {}

  // 🔹 Register
  async register(
    name: string,
    email: string,
    password: string,
  ): Promise<{ access_token: string }> {
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) throw new ConflictException('Email already registered');

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new this.userModel({
      user_id: uuidv4(),
      name,
      email,
      password: hashedPassword,
    });

    const savedUser = await user.save();

    // 🔥 Auto-create profile linked to this user
    await this.profileService.createProfile(savedUser.user_id);

    // Generate JWT token for immediate login after registration
    const payload = { sub: savedUser.user_id, email: savedUser.email };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // 🔹 Login
  async login(
    email: string,
    password: string,
  ): Promise<{ access_token: string }> {
    const user = await this.userModel.findOne({ email });
    
    if (!user) throw new UnauthorizedException('User not found Please Register');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.user_id, email: user.email };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
