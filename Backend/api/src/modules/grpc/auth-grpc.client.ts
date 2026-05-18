import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { join } from 'path';


const PROTO_PATH = join(process.cwd(), 'proto', 'auth.proto');

@Injectable()
export class AuthGrpcClient implements OnModuleInit {
  private readonly logger = new Logger(AuthGrpcClient.name);
  private client: any;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const url =
      this.configService.get<string>('AUTH_GRPC_URL') ||
      `${this.configService.get<string>('AUTH_GRPC_HOST', 'localhost')}:${this.configService.get<string>('AUTH_GRPC_PORT', '50050')}`;

    const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });

    const proto = grpc.loadPackageDefinition(packageDefinition) as any;
    this.client = new proto.auth.AuthService(
      url,
      grpc.credentials.createInsecure(),
    );
    this.logger.log(`Auth gRPC client connected to ${url}`);
  }

  private call<T>(method: string, request: any): Promise<T> {
    return new Promise((resolve, reject) => {
      this.client[method](request, (error: any, response: T) => {
        if (error) reject(error);
        else resolve(response);
      });
    });
  }

  registerMail(data: { mail?: string; password?: string; username?: string }) {
    return this.call<any>('registerMail', data);
  }

  loginMail(data: { mail?: string; password?: string }) {
    return this.call<any>('loginMail', data);
  }

  validateAccess(data: { identity_id?: string; iat?: number }) {
    return this.call<any>('validateAccess', data);
  }

  validateRefresh(data: { identity_id?: string; iat?: number }) {
    return this.call<any>('validateRefresh', data);
  }

  refresh(data: { identity_id?: string }) {
    return this.call<any>('refresh', data);
  }

  logOutAll(data: { identity_id?: string }) {
    return this.call<any>('logOutAll', data);
  }

  hydrateIdentity(data: { identity_id?: string }) {
    return this.call<any>('hydrateIdentity', data);
  }

  hydrateIdentities(data: { identity_ids?: string[] }) {
    return this.call<any>('hydrateIdentities', data);
  }

  lockIdentity(data: { identity_id?: string; locked_by?: string }) {
    return this.call<any>('lockIdentity', data);
  }

  unlockIdentity(data: { identity_id?: string }) {
    return this.call<any>('unlockIdentity', data);
  }

  assignRoleTo(data: { identity_id?: string; role_id?: string }) {
    return this.call<any>('assignRoleTo', data);
  }

  updateIdentity(data: { identity_id?: string; full_name?: string; phone_number?: string; avatar_file_id?: string; bio?: string }) {
    return this.call<any>('updateIdentity', data);
  }

  getRoleList() {
    return this.call<any>('getRoleList', {});
  }
}
