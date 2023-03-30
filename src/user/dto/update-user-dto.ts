import { IsEmail, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsEmail()
  readonly email: string;

  @IsString()
  readonly bio?: string;

  @IsString()
  readonly image?: string;

  @IsString()
  readonly username: string;
}
