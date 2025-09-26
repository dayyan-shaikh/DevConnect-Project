import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Profile, ProfileDocument } from './schemas/profile.schema';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { v4 as uuidv4 } from 'uuid';
import { User, UserDocument } from '../auth/schemas/user.schema';

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(Profile.name) private profileModel: Model<ProfileDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  // Create profile right after registration
  async createProfile(user_id: string): Promise<Profile> {
    const user = await this.userModel.findOne({ user_id });
    if (!user) throw new NotFoundException('User not found');

    const newProfile = new this.profileModel({
      id: uuidv4(),
      user_id,
      name: user.name,
      education: [],
      skills: [],
      projects: [],
      socialLinks: {},
    });

    return newProfile.save();
  }

  async getProfiles(cursor?: string, limit: number = 25) {
    const query: any = {};
    
    // If cursor provided, only get profiles with _id greater than cursor
    if (cursor) {
      // Validate cursor is a valid ObjectId
      if (!Types.ObjectId.isValid(cursor)) {
        throw new Error('Invalid cursor format');
      }
      query._id = { $gt: new Types.ObjectId(cursor) };
    }

    // Fetch profiles sorted by _id
    const profiles = await this.profileModel
      .find(query)
      .sort({ _id: 1 }) // ascending order
      .limit(limit + 1); // fetch one extra to check next cursor

    let nextCursor: string | null = null;
    if (profiles.length > limit) {
      const nextProfile = profiles.pop(); // remove extra doc
      nextCursor = nextProfile?._id?.toString() || null;
    }

    return {
      data: profiles,
      nextCursor,
      hasNextPage: !!nextCursor,
    };
  }

  async getProfile(id: string): Promise<Profile> {
    // First try to find by id field (UUID)
    let profile = await this.profileModel.findOne({ id }).exec();
    
    // If not found by UUID, try by _id (ObjectId)
    if (!profile) {
      try {
        profile = await this.profileModel.findById(id).exec();
      } catch (error) {
        // Ignore invalid ObjectId format errors
      }
    }
    
    if (!profile) throw new NotFoundException('Profile not found');
    return profile.toObject();
  }

  async getProfileByUserId(user_id: string): Promise<Profile> {
    const profile = await this.profileModel.findOne({ user_id });
    if (!profile) throw new NotFoundException('Profile not found');
    return profile;
  }

  async updateProfile(
    id: string,
    dto: UpdateProfileDto,
  ): Promise<Profile> {
    const updated = await this.profileModel.findOneAndUpdate(
      { id },
      { $set: dto },
      { new: true },
    );
    if (!updated) throw new NotFoundException('Profile not found');
    return updated;
  }
}
