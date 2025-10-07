import {
  Controller,
  Get,
  Param,
  Put,
  Body,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('profile')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  /**
   * Create Profile automatically when user registers.
   */
  @Post(':user_id')
  async createProfile(@Param('user_id') user_id: string) {
    return this.profileService.createProfile(user_id);
  }

  /**
   * Get all profiles (cursor-based pagination)
   */
  @Get()
  async getProfiles(
    @Query('cursor') cursor?: string,
    @Query('limit') limit: number = 25,
  ) {
    return this.profileService.getProfiles(cursor, limit);
  }

  /**
   * Get profile by profile_id
   */
  @Get(':profile_id')
  async getProfile(@Param('profile_id') profile_id: string) {
    return this.profileService.getProfile(profile_id);
  }

  /**
   * Get profile by user_id
   */
  @Get('user/:user_id')
  async getProfileByUserId(@Param('user_id') user_id: string) {
    return this.profileService.getProfileByUserId(user_id);
  }

  /**
   * Update profile info
   */
  @Put(':profile_id')
  async updateProfile(
    @Param('profile_id') profile_id: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.profileService.updateProfile(profile_id, dto);
  }

  // Upload avatar (profile image) to Cloudinary
  @Post(':profile_id/avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(new BadRequestException('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
    }),
  )
  async uploadAvatar(
    @Param('profile_id') profile_id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No file provided');

    // Get the profile to check & remove existing avatar
    const profile = await this.profileService.getProfile(profile_id);
    if (!profile) throw new BadRequestException('Profile not found');

    // Delete old avatar from Cloudinary if exists
    if (profile.avatarPublicId) {
      await this.cloudinaryService.delete(profile.avatarPublicId).catch(() => null);
    }

    // Upload new image to Cloudinary
    const uploadResult = await this.cloudinaryService.uploadImageFromBuffer(file.buffer, {
      folder: 'devconnect/avatars',
      public_id: `profile_${profile_id}`,
    });

    const updatedProfile = await this.profileService.updateAvatar(
      profile_id,
      uploadResult.secure_url,
      uploadResult.public_id,
    );

    return {
      message: 'Avatar uploaded successfully!',
      avatarUrl: uploadResult.secure_url,
      profile: updatedProfile,
    };
  }
}
