import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthGuard } from './guards/auth-guard';

@Module({
  providers: [UserService, PrismaService, AuthGuard],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
