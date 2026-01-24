import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: join(__dirname, '..', '..', '..', 'database', 'lingriser.db'),
      entities: [join(__dirname, '..', '**', '*.entity{.ts,.js}')],
      synchronize: false, // We use our own schema.sql
      logging: process.env.NODE_ENV === 'development',
    }),
  ],
})
export class DatabaseModule {}

