import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserDto } from 'src/user/dto/user-object-dto';
import { CreateArticleDto } from './dto/create-article-dto';
import slugify from 'slugify';
import { UpdateArticleDto } from './dto/update-article-dto';

@Injectable()
export class ArticleService {
  constructor(private readonly prisma: PrismaService) {}

  async createArticle(
    user: UserDto,
    createArticleDto: CreateArticleDto,
  ): Promise<any> {
    //   TODO: find a way how to fake that list
    let tagList: string | null = '';

    let num = 0;
    if (createArticleDto.tagList) {
      for (const tag of createArticleDto.tagList) {
        if (num !== 0) {
          tagList += `, ${tag}`;
        }
        if (num === 0) tagList += `${tag}`;
        num++;
      }
    }
    if (!createArticleDto.tagList) tagList = null;

    const slug = slugify(createArticleDto.title, {
      replacement: '-',
      lower: true,
    });

    // make sure slug is random
    const randEnd = ((Math.random() * Math.pow(36, 6)) | 0).toString(36);

    const article = await this.prisma.article.create({
      data: {
        ...createArticleDto,
        slug: slug + '_' + randEnd,
        tagList: tagList,
        authorId: user.id,
      },
    });
    return article;
  }

  async getArticleBySlug(slug: string) {
    const article = await this.prisma.article.findFirst({
      where: { slug: slug },
    });

    if (!article)
      throw new HttpException(
        `there is not article with ${slug} slug`,
        HttpStatus.NOT_FOUND,
      );

    return article;
  }

  async getAllArticlesByUserId(id: number) {
    const articles = await this.prisma.article.findMany({
      where: {
        authorId: id,
      },
    });

    if (!articles)
      throw new HttpException(
        `there is not article with ${id} author id`,
        HttpStatus.NOT_FOUND,
      );

    return articles;
  }

  async deleteArticle(slug: string, currentUserId: number) {
    const article = await this.prisma.article.findFirst({
      where: { slug: slug, authorId: currentUserId },
    });

    if (!article) {
      throw new HttpException(
        `There is no article with '${slug}' slug for author with id '${currentUserId}'`,
        HttpStatus.NOT_FOUND,
      );
    }

    const deletedArticle = await this.prisma.article.delete({
      where: { id: article.id },
    });

    return { message: 'Successfully deleted', deletedArticle };
  }

  async updateArticle(
    slug: string,
    currentUserId: number,
    body: Partial<UpdateArticleDto>,
  ) {
    const article = await this.prisma.article.findFirst({
      where: { slug: slug, authorId: currentUserId },
    });

    if (!article) {
      throw new HttpException(
        `There is no article with '${slug}' slug for author with id '${currentUserId}'`,
        HttpStatus.NOT_FOUND,
      );
    }
    if (body.title) {
      const randEnd = ((Math.random() * Math.pow(36, 6)) | 0).toString(36);
      body['slug'] =
        slugify(body.title, {
          replacement: '-',
          lower: true,
        }) + randEnd;
    }

    const updatedArticle = await this.prisma.article.update({
      where: { id: article.id },
      data: {
        ...body,
      },
    });

    return { message: 'Successfully updated', updatedArticle };
  }

  async getArticleByTitle(title: string) {
    const article = await this.prisma.article.findFirst({
      where: { title: title },
    });

    if (!article) {
      throw new HttpException(
        `There is not article with title of ${title}`,
        HttpStatus.NOT_FOUND,
      );
    }

    return article;
  }

  async getAllArticles() {
    const articles = await this.prisma.article.findMany();

    if (!articles) {
      throw new HttpException(
        'There are not articles yet',
        HttpStatus.NOT_FOUND,
      );
    }

    return articles;
  }
}
