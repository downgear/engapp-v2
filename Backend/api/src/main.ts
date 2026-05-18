import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const allowedOrigins = process.env.CORS_ORIGINS 
    ? process.env.CORS_ORIGINS.split(',') 
    : [
        'http://localhost:8080', 
        'http://localhost:8081', 
        'http://localhost:5173', 
        'http://localhost:1515',
        'http://khoakomlem-internal.ddns.net:8080'
      ];
  
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      if (origin.includes('khoakomlem-internal.ddns.net')) return callback(null, true);
      if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return callback(null, true);
      callback(null, true);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));
  
  app.setGlobalPrefix('api');
  
  const port = process.env.PORT || 1515;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Lingriser API is running on port ${port}`);
}
bootstrap();
