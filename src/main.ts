import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.setGlobalPrefix('api/v1');
  app.use((req, res, next) => {
    res.set("X-Powered-By", "rsvgsng-11-may-24")
    res.set("server", "_theGoose")
    next()
  })

  await app.listen(3000);
}
bootstrap();
