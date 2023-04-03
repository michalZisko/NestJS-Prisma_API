import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { User } from 'src/decorators/user.decorator';
import { AuthGuard } from 'src/user/guards/auth-guard';
import { feedQuery, ProfileService } from './profile.service';

@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':username')
  async getProfile(
    @Param('username') username: string,
    @User('id') currentUserId: number,
  ) {
    return await this.profileService.getProfile(username, currentUserId);
  }

  @UseGuards(AuthGuard)
  @Post(':username/follow')
  async followUser(
    @Param('username') username: string,
    @User('id') currentUserId: number,
  ) {
    return await this.profileService.followUser(username, currentUserId);
  }

  @UseGuards(AuthGuard)
  @Delete(':username/follow')
  async unfollowUser(
    @Param('username') username: string,
    @User('id') currentUserId: number,
  ) {
    return await this.profileService.unfollowUser(username, currentUserId);
  }

  @UseGuards(AuthGuard)
  @Get('feed')
  async getFeed(@User('id') currentUserId: number, @Query() query: feedQuery) {
    return await this.profileService.getFeed(currentUserId, query);
  }
}
