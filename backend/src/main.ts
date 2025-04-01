import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // console.log("PORT:", process.env.PORT);
  app.enableCors({
    origin: "http://localhost:3000", // Permite cereri de la frontend
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, // Permite cookies daca ai nevoie
  });
  
  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
