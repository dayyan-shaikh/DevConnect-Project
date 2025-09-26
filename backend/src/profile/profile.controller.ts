// src/profile/profile.controller.ts
import { Controller, Get, Param, Put, Body, Post, Query } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) { }

  // Called after user registers
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
}
