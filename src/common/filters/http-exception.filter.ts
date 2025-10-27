import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Global exception filter for handling HTTP exceptions
 * Provides consistent error response format and logging
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error = 'InternalServerError';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = exception.name;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        // Narrow safely and avoid `any` accesses
        const responseObj = exceptionResponse as Record<string, unknown>;
        message =
          typeof responseObj.message === 'string' ||
          Array.isArray(responseObj.message)
            ? responseObj.message
            : exception.message;
        error =
          typeof responseObj.error === 'string'
            ? responseObj.error
            : exception.name;
      }
    } else if (exception instanceof Error) {
      // Log unexpected errors with stack trace
      this.logger.error(
        `Unexpected error: ${exception.message}`,
        exception.stack,
      );
    } else {
      // Handle non-Error values thrown
      this.logger.error(`Unexpected error: ${String(exception)}`);
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      error,
    };

    // Log request details safely
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${String(
        Array.isArray(message) ? message.join(', ') : message,
      )}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json(errorResponse);
  }
}
