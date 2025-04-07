import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // console.log("PORT:", process.env.PORT);
  
  app.enableCors({
    origin: "http://localhost:3000", // allow requests from this origin
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, // allow cookies to be sent
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Strip properties that do not have decorators
    forbidNonWhitelisted: true, // Throw error if extra fields are sent
    transform: true, // Auto-transform payloads to DTO instances
  }));
  
  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
