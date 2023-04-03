import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(username: string, currentUserId: number) {
    const user = await this.prisma.users.findFirst({
      where: { username: username },
      select: {
        username: true,
        bio: true,
        image: true,
      },
    });

    if (!user) {
      throw new HttpException(
        `profile for user '${username}' does not exist`,
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      ...user,
      following: false,
    };
  }

  async followUser(username: string, currentUserId: number) {
    const userToFollow = await this.prisma.users.findFirst({
      where: { username: username },
    });

    if (!userToFollow) {
      throw new HttpException(
        `there is no user with '${username}' username`,
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.prisma.follow.create({
      data: {
        followerId: currentUserId,
        followingId: userToFollow.id,
      },
    });

    return { ...userToFollow, following: true };
  }

  async unfollowUser(username: string, currentUserId: number) {
    const userToUnfollow = await this.prisma.users.findFirst({
      where: {
        username: username,
      },
    });

    if (!userToUnfollow) {
      throw new HttpException(
        `there is no user with '${username}' username`,
        HttpStatus.NOT_FOUND,
      );
    }

    if (userToUnfollow.id === currentUserId) {
      throw new HttpException(
        'Follower and following cannot be equal',
        HttpStatus.FORBIDDEN,
      );
    }

    const followToDelete = await this.prisma.follow.findFirst({
      where: {
        AND: {
          followerId: currentUserId,
          followingId: userToUnfollow.id,
        },
      },
    });

    await this.prisma.follow.delete({
      where: { id: followToDelete.id },
    });

    return { ...userToUnfollow, following: false };
  }

  async getFeed(currentUserId: number, query: feedQuery) {
    const follows = await this.prisma.follow.findMany({
      where: { followerId: currentUserId },
    });

    if (follows.length === 0) {
      return { articles: [], articlesCount: 0 };
    }

    const followingUsersIds = follows.map((follow) => follow.followingId);

    const feed = await this.prisma.article.findMany({
      where: {
        authorId: {
          in: followingUsersIds,
        },
      },
      select: {
        Author: {
          select: {
            id: true,
          },
        },
        slug: true,
        title: true,
        description: true,
        body: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: query.offset ? query.offset : undefined,
      take: query.limit ? query.limit : undefined,
    });

    return { articles: feed, articlesCount: feed.length };
  }
}

export interface feedQuery {
  limit: number;
  offset: number;
}
