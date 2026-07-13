import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type CurrentAdminData = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};

export const CurrentAdmin = createParamDecorator(
  (_data: unknown, context: ExecutionContext): CurrentAdminData => {
    const request = context.switchToHttp().getRequest<{
      user: CurrentAdminData;
    }>();

    return request.user;
  },
);