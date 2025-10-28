// src/common/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { UserDocument } from 'src/users/schemas/user.schema';

/**
 * Retrieves the currently authenticated user from the request
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UserDocument | undefined => {
    const req = ctx
      .switchToHttp()
      .getRequest<Request & { user?: UserDocument }>();
    return req.user;
  },
);
