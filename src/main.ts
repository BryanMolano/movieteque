import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {ValidationPipe} from "@nestjs/common";

async function bootstrap()
{
  const app = await NestFactory.create(AppModule);
  
  // Seguridad CORS estricta
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'; // Ajusta el puerto local si es diferente
  app.enableCors({
    origin: frontendUrl,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  }));
  await app.listen(process.env.PORT || 3000);
}

bootstrap();
