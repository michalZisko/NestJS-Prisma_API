import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user-dto';
import { hash, compare } from 'bcrypt';
import { UserDto } from './dto/user-object-dto';
import { sign } from 'jsonwebtoken';
import { LoginUserDto } from './dto/login-user-dto';
import { UpdateUserDto } from './dto/update-user-dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(user: CreateUserDto) {
    const passwordHash = await hash(user.password, 10);

    const userByEmail = await this.prisma.users.findFirst({
      where: { email: user.email },
    });

    const userByUsername = await this.prisma.users.findFirst({
      where: { username: user.username },
    });

    if (userByEmail || userByUsername) {
      throw new HttpException(
        'user already exists',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    return await this.prisma.users.create({
      data: { hash: passwordHash, username: user.username, email: user.email },
      select: { id: true, email: true, bio: true, username: true, image: true },
    });
  }

  private generateJWT(user: UserDto): string {
    return sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      'MySecretKey',
    );
  }

  async buildUserResponse(user: UserDto) {
    return {
      user: {
        ...user,
        JWT: this.generateJWT(user),
      },
    };
  }

  async login(loginUserDto: LoginUserDto) {
    // check if user with given username exists
    const user = await this.prisma.users.findFirst({
      where: { username: loginUserDto.username },
      select: {
        hash: true,
        bio: true,
        username: true,
        image: true,
        email: true,
        id: true,
      },
    });

    // if not, throw exception
    if (!user) {
      throw new HttpException('user does not exists', HttpStatus.FORBIDDEN);
    }

    // if yes, check if password is the same as stored password hash
    const isPasswordCorrect = await compare(loginUserDto.password, user.hash);

    if (!isPasswordCorrect) {
      throw new HttpException('wrong credentials', HttpStatus.FORBIDDEN);
    }

    // if success, return user with JWT, but without passwword hash
    delete user.hash;
    return { user: { ...user, JWT: this.generateJWT(user) } };
  }

  async findByUsername(username: string, hash: boolean) {
    return await this.prisma.users.findFirst({
      where: { username: username },
      select: {
        email: true,
        bio: true,
        username: true,
        image: true,
        hash: hash,
        id: true,
      },
    });
  }

  async updateUser(id: number, user: Partial<UpdateUserDto>) {
    const userInDb = await this.prisma.users.findFirst({
      where: { id: id },
    });

    if (!userInDb) {
      throw new HttpException('user does not exist', HttpStatus.BAD_REQUEST);
    }

    return await this.prisma.users.update({
      where: { id: id },
      data: { ...user },
      select: { email: true, username: true, bio: true, image: true },
    });
  }

  async deleteUser(userId: number) {
    const user = await this.prisma.users.findFirst({ where: { id: userId } });

    if (!user) {
      throw new HttpException('Cannot delete user', HttpStatus.BAD_REQUEST);
    }

    return await this.prisma.users.delete({ where: { id: userId } });
  }
}
