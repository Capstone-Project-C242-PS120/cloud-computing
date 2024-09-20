import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { ResponseWrapper } from '../wrapper/response.wrapper';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const request = ctx.getRequest();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as any;
    const message = exceptionResponse.message || 'Internal server error';

    response.status(status).json(new ResponseWrapper(status, message));
  }
}
