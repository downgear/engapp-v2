import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_nkji5mU2JoMr@ep-morning-unit-ahp0dh7v-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require',
      entities: [join(__dirname, '..', '**', '*.entity{.ts,.js}')],
      synchronize: false, // We use our own schema.sql
      logging: process.env.NODE_ENV === 'development',
      ssl: {
        rejectUnauthorized: false,
      },
      // Retry on connection loss (ECONNRESET)
      retryAttempts: 10,
      retryDelay: 3000,
      // Connection pool settings for Neon serverless
      extra: {
        // Keep idle connections alive
        keepAlive: true,
        keepAliveInitialDelayMillis: 10000,
        // Pool settings
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      },
    }),
  ],
})
export class DatabaseModule {}

