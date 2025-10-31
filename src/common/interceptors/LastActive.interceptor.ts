// src/common/interceptors/last-active.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { Observable } from 'rxjs';

@Injectable()
export class LastActiveInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LastActiveInterceptor.name);

  constructor(private readonly userService: UsersService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<{ user?: { id: string } }>();
    const user = req.user;

    if (user?.id) {
      // Update asynchronously so it doesn't block the response
      this.userService
        .updateLastActive(user.id)
        .catch((err) =>
          this.logger.error(
            `Failed to update lastActiveAt for user ${user.id}`,
            err,
          ),
        );
    }

    return next.handle();
  }
}
