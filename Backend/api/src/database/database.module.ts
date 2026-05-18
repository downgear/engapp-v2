import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL || 'postgresql://lingriser:lingriser@localhost:5432/lingriser',
      entities: [join(__dirname, '..', '**', '*.entity{.ts,.js}')],
      synchronize: false,
      logging: process.env.NODE_ENV === 'development',
      ...(process.env.DATABASE_URL?.includes('neon.tech')
        ? { ssl: { rejectUnauthorized: false } }
        : {}),
      retryAttempts: 10,
      retryDelay: 3000,
      extra: {
        keepAlive: true,
        keepAliveInitialDelayMillis: 10000,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      },
    }),
  ],
})
export class DatabaseModule {}

