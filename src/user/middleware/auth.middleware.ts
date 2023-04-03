import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { ExpressRequest } from 'src/types/expressRequest-intergface';
import { verify } from 'jsonwebtoken';
import { UserService } from '../user.service';

interface JwTPayload {
  username: string;
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService) {}
  async use(req: ExpressRequest, _: Response, next: NextFunction) {
    if (!req.headers.authorization) {
      req.user = null;
      next();
      return;
    }
    const token = req.headers.authorization.split(' ')[1];

    try {
      const decoded = verify(token, 'MySecretKey') as JwTPayload;

      const user = await this.userService.findByUsername(
        decoded.username,
        false,
      );
      req.user = user;

      next();
    } catch (error) {
      req.user = null;
      next();
      console.log(error);
    }
  }
}
