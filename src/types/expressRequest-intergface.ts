import { Request } from 'express';
import { UserDto } from 'src/user/dto/user-object-dto';

export interface ExpressRequest extends Request {
  user?: UserDto;
}
