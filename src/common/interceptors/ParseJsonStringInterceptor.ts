import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class ParseJsonFieldsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const rawBody = req.body as unknown;

    // Safely narrow to a plain object
    const body =
      typeof rawBody === 'object' && rawBody !== null
        ? (rawBody as Record<string, unknown>)
        : ({} as Record<string, unknown>);

    const jsonFields = ['address', 'avatar', 'interests'] as const;

    for (const key of jsonFields) {
      const val = body[key];

      if (typeof val === 'string') {
        try {
          const parsed: unknown = JSON.parse(val); // 👈 safely type as unknown
          body[key] = parsed;
        } catch {
          // ignore malformed JSON
        }
      }
    }

    // reassign sanitized body
    req.body = body;

    return next.handle();
  }
}
