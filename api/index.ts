import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import serverless from 'serverless-http';
import { AppModule } from '../server/app.module';

let cachedHandler: ReturnType<typeof serverless> | undefined;

async function bootstrap() {
  if (cachedHandler) return cachedHandler;
  const expressApp = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp), { logger: ['error', 'warn'] });
  app.enableCors({
    origin: process.env.VITE_NEXUS_IFRAME_ORIGIN || true,
    credentials: true
  });
  app.setGlobalPrefix('api');
  await app.init();
  cachedHandler = serverless(expressApp);
  return cachedHandler;
}

export default async function handler(req: any, res: any) {
  const server = await bootstrap();
  return server(req, res);
}
