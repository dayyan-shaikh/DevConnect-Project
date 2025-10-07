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
    if (!file) throw new BadRequestException('No file provided');

    const profile = await this.profileService.getProfile(profile_id);
    if (!profile) throw new BadRequestException('Profile not found');
    
    if (profile.user_id !== req.user.userId) {
      throw new UnauthorizedException('You can only update your own profile picture');
    }

    if (profile.avatarPublicId) {
      await this.cloudinaryService.delete(profile.avatarPublicId).catch(() => null);
    }
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
