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

  /**
   * Create a profile right after registration
   */
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
      avatar: '',
      avatarPublicId: '',
    });

    return newProfile.save();
  }

  /**
   * Get all profiles with cursor pagination
   */
  async getProfiles(cursor?: string, limit: number = 25) {
    const query: any = {};

    if (cursor) {
      if (!Types.ObjectId.isValid(cursor)) {
        throw new Error('Invalid cursor format');
      }
      query._id = { $gt: new Types.ObjectId(cursor) };
    }

    const profiles = await this.profileModel
      .find(query)
      .sort({ _id: 1 })
      .limit(limit + 1);

    let nextCursor: string | null = null;
    if (profiles.length > limit) {
      const nextProfile = profiles.pop();
      nextCursor = nextProfile?._id?.toString() || null;
    }

    return {
      data: profiles,
      nextCursor,
      hasNextPage: !!nextCursor,
    };
  }

  /**
   * Get profile by id (UUID or ObjectId)
   */
  async getProfile(id: string): Promise<Profile> {
    let profile = await this.profileModel.findOne({ id }).exec();

    if (!profile) {
      try {
        profile = await this.profileModel.findById(id).exec();
      } catch (error) {
        // ignore invalid ObjectId format
      }
    }

    if (!profile) throw new NotFoundException('Profile not found');
    return profile.toObject();
  }

  /**
   * Get profile by user_id
   */
  async getProfileByUserId(user_id: string): Promise<Profile> {
    const profile = await this.profileModel.findOne({ user_id });
    if (!profile) throw new NotFoundException('Profile not found');
    return profile;
  }

  /**
   * Update profile details
   */
  async updateProfile(id: string, dto: UpdateProfileDto): Promise<Profile> {
    const updated = await this.profileModel.findOneAndUpdate(
      { id },
      { $set: dto },
      { new: true },
    );
    if (!updated) throw new NotFoundException('Profile not found');
    return updated;
  }

  /**
   * Update avatar (used after Cloudinary upload)
   */
  async updateAvatar(
    profileId: string,
    avatarUrl: string,
    avatarPublicId: string,
  ): Promise<Profile> {
    const updated = await this.profileModel.findOneAndUpdate(
      { id: profileId },
      {
        $set: {
          avatar: avatarUrl,
          avatarPublicId,
        },
      },
      { new: true },
    );

    if (!updated) throw new NotFoundException('Profile not found');
    return updated;
  }
}
