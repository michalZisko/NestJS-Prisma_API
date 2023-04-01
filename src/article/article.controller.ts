import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { User } from 'src/decorators/user.decorator';
import { UserDto } from 'src/user/dto/user-object-dto';
import { AuthGuard } from 'src/user/guards/auth-guard';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article-dto';
import { UpdateArticleDto } from './dto/update-article-dto';

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @UseGuards(AuthGuard)
  @Post()
  async createArticle(
    // @User('id') currentUserId: number,
    @User() user: UserDto,
    @Body('article') createArticleDto: CreateArticleDto,
  ) {
    return await this.articleService.createArticle(user, createArticleDto);
  }

  @Get(':slug')
  async getArticle(@Param('slug') slug: string) {
    return await this.articleService.getArticleBySlug(slug);
  }

  @Get('user/:userId')
  async getAllArticlesByUser(@Param('userId') id: number) {
    return await this.articleService.getAllArticlesByUserId(+id);
  }

  @UseGuards(AuthGuard)
  @Delete('user/:slug')
  async deleteArticle(@Param('slug') slug: string, @User('id') userId: number) {
    return await this.articleService.deleteArticle(slug, +userId);
  }

  @UseGuards(AuthGuard)
  @Put('/user/:slug')
  async updateArticle(
    @Param('slug') slug: string,
    @User('id') userId: number,
    @Body('article') updateArticleBody: Partial<UpdateArticleDto>,
  ) {
    return await this.articleService.updateArticle(
      slug,
      userId,
      updateArticleBody,
    );
  }

  @Get('/article/:title')
  async getArticleByTitle(@Param('title') title: string) {
    return await this.articleService.getArticleByTitle(title);
  }

  @Get()
  async getAllArticles(@User('id') id: number, @Query() query: any) {
    console.log(query);
    return await this.articleService.findAll(id, query);
  }

  @Post(':slug/favorite')
  @UseGuards(AuthGuard)
  async likeArticle(@Param('slug') slug: string, @User('id') id: number) {
    return await this.articleService.likeArticle(id, slug);
  }

  @Delete(':slug/favorite')
  @UseGuards(AuthGuard)
  async dislikeArticle(@Param('slug') slug: string, @User('id') id: number) {
    return await this.articleService.dislikeArticle(id, slug);
  }
}
