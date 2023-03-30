import { IsInt, IsString } from 'class-validator';

export class TagsDto {
  @IsInt()
  id: number;

  @IsString()
  name: string;
}
