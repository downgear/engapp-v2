import { Global, Module } from '@nestjs/common';
import { AuthGrpcClient } from './auth-grpc.client';
import { NotificationGrpcClient } from './notification-grpc.client';

@Global()
@Module({
  providers: [AuthGrpcClient, NotificationGrpcClient],
  exports: [AuthGrpcClient, NotificationGrpcClient],
})
export class GrpcModule {}
