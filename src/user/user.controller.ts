import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user-dto';
import { LoginUserDto } from './dto/login-user-dto';
import { UserService } from './user.service';
import { User } from 'src/decorators/user.decorator';
import { UserDto } from './dto/user-object-dto';
import { AuthGuard } from './guards/auth-guard';
import { UpdateUserDto } from './dto/update-user-dto';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('users')
  async createUser(@Body('user') createUserDto: CreateUserDto): Promise<any> {
    const user = await this.userService.createUser(createUserDto);

    return await this.userService.buildUserResponse(user);
  }

  @Post('users/login')
  async login(@Body('user') loginUserDto: LoginUserDto): Promise<any> {
    return await this.userService.login(loginUserDto);
  }

  @Get('user')
  @UseGuards(AuthGuard)
  async currentUser(@User() user: UserDto): Promise<any> {
    return await this.userService.buildUserResponse(user);
  }

  @Put('user')
  @UseGuards(AuthGuard)
  async updateUser(
    @User('id') id: UserDto,
    @Body('user') updateUserDto: Partial<UpdateUserDto>,
  ) {
    const user = await this.userService.updateUser(+id, updateUserDto);
    return await this.userService.buildUserResponse(user);
  }

  @Delete('user')
  @UseGuards(AuthGuard)
  async deleteUser(@User('id') id: number) {
    return this.userService.deleteUser(id);
  }
}
