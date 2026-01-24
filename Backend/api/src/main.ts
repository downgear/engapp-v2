import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Get allowed origins from environment or use defaults
  const allowedOrigins = process.env.CORS_ORIGINS 
    ? process.env.CORS_ORIGINS.split(',') 
    : [
        'http://localhost:8080', 
        'http://localhost:8081', 
        'http://localhost:5173', 
        'http://localhost:3000'
      ];
  
  // Enable CORS for frontend connection
  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));
  
  // API prefix
  app.setGlobalPrefix('api');
  
  // Use PORT from environment (Railway provides this) or default to 3001
  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Lingriser API is running on port ${port}`);
}
bootstrap();
