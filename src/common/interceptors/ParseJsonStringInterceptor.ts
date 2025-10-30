import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class ParseJsonFieldsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const jsonFields = ['address', 'avatar', 'interests'];

    for (const key of jsonFields) {
      const val = req.body[key];
      if (typeof val === 'string') {
        try {
          req.body[key] = JSON.parse(val);
        } catch {
          // ignore parsing error
        }
      }
    }

    return next.handle();
  }
}
