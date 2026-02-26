import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes';

async function bootstrap() {
  const logger = new Logger('main');
  const app = await NestFactory.create(AppModule);

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  app.useGlobalPipes(
    new ValidationPipe({
      disableErrorMessages: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Your Content Creator API docs')
    .setDescription('')
    .setVersion('1.0')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);

  const theme = new SwaggerTheme();

  SwaggerModule.setup('docs', app, documentFactory, {
    customCss: theme.getBuffer(SwaggerThemeNameEnum.CLASSIC),
  });

  await app.listen(process.env.PORT ?? 4000);
  logger.log(`app running on: http://localhost:${process.env.PORT ?? 4000}`);
  logger.log(`swagger: http://localhost:${process.env.PORT ?? 4000}/docs`);
}

bootstrap()
  .then(() => {})
  .catch(() => {});
