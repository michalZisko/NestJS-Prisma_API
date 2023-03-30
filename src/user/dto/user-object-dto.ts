import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UserDto {
  @IsNotEmpty()
  readonly id?: number;

  @IsEmail()
  @IsString()
  readonly email: string;

  @IsString()
  readonly hash?: string;

  @IsString()
  readonly username: string;

  @IsString()
  readonly bio?: string;

  @IsString()
  readonly image?: string;
}
