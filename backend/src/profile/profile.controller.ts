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
  UseGuards,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
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


  @Post(':user_id')
  async createProfile(@Param('user_id') user_id: string) {
    return this.profileService.createProfile(user_id);
  }


  @Get()
  async getProfiles(
    @Query('cursor') cursor?: string,
    @Query('limit') limit: number = 25,
  ) {
    return this.profileService.getProfiles(cursor, limit);
  }


  @Get(':profile_id')
  async getProfile(@Param('profile_id') profile_id: string) {
    return this.profileService.getProfile(profile_id);
  }


  @Get('user/:user_id')
  async getProfileByUserId(@Param('user_id') user_id: string) {
    return this.profileService.getProfileByUserId(user_id);
  }

  @Put(':profile_id')
  async updateProfile(
    @Param('profile_id') profile_id: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.profileService.updateProfile(profile_id, dto);
  }

  @Post(':profile_id/avatar')
  @UseGuards(JwtAuthGuard)
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
    @Request() req: any,
  ) {
    try {
      console.log('Uploading avatar for profile:', profile_id);
      console.log('File received:', file?.originalname, 'Size:', file?.size);

      if (!file) {
        console.error('No file provided in request');
        throw new BadRequestException('No file provided');
      }

      console.log('Fetching profile...');
      const profile = await this.profileService.getProfile(profile_id);
      if (!profile) {
        console.error('Profile not found:', profile_id);
        throw new BadRequestException('Profile not found');
      }
      
      console.log('Verifying user ownership...');
      console.log('Profile user_id:', profile.user_id, typeof profile.user_id);
      console.log('Request user ID:', req.user?.userId, typeof req.user?.userId);
      
      if (profile.user_id.toString() !== req.user?.userId?.toString()) {
        console.error('Unauthorized access attempt:', {
          profileUserId: profile.user_id,
          requestUserId: req.user?.userId
        });
        throw new UnauthorizedException('You can only update your own profile picture');
      }

      if (profile.avatarPublicId) {
        console.log('Deleting old avatar:', profile.avatarPublicId);
        try {
          await this.cloudinaryService.delete(profile.avatarPublicId);
          console.log('Successfully deleted old avatar');
        } catch (deleteError) {
          console.error('Error deleting old avatar, continuing with upload:', deleteError);
        }
      }

      console.log('Uploading new avatar to Cloudinary...');
      const uploadOptions = {
        folder: 'devconnect/avatars',
        public_id: `profile_${profile_id}`,
      };
      console.log('Upload options:', uploadOptions);
      
      const uploadResult = await this.cloudinaryService.uploadImageFromBuffer(
        file.buffer,
        uploadOptions
      );
      console.log('Cloudinary upload successful:', uploadResult?.secure_url);

      console.log('Updating profile with new avatar...');
      const updatedProfile = await this.profileService.updateAvatar(
        profile_id,
        uploadResult.secure_url,
        uploadResult.public_id,
      );
      console.log('Profile updated successfully');

      return {
        message: 'Avatar uploaded successfully!',
        avatarUrl: uploadResult.secure_url,
        profile: updatedProfile,
      };
    } catch (error) {
      console.error('Error in uploadAvatar:', error);
      if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new Error('Failed to upload avatar. Please try again.');
    }
  }
}
