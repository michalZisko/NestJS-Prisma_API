import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TagsDto } from './dto/tags-dto';

@Injectable()
export class TagService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<TagsDto[]> {
    return await this.prisma.tags.findMany();
  }
}
