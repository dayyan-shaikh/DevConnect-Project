import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for your frontend
  app.enableCors({
    origin: ["http://localhost:5173", "https://your-frontend.vercel.app"], // React frontend URL
    credentials: true, // if you want cookies or auth headers
  });

  await app.listen(3000);
}
bootstrap();