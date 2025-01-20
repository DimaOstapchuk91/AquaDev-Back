import express from 'express';
import cors from 'cors';
// import pino from 'pino-http';
import cookieParser from 'cookie-parser';
import allRouters from './routers/index.js';
import { env } from './utils/env.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { swaggerDocs } from './middlewares/swaggerDocs.js';
const PORT = Number(env('PORT', '3000'));

export const setupServer = () => {
  const app = express();

  const corsOptions = {
    origin: ['http://localhost:5173', 'https://aqua-dev-amber.vercel.app'],
    methods: 'GET,POST,PATCH,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true,
  };

  app.use(cors(corsOptions));

  app.use(cookieParser());

  app.use('/api-docs', swaggerDocs());

  // app.use(
  //   pino({
  //     transport: {
  //       target: 'pino-pretty',
  //     },
  //   }),
  // );
  // закоментовано для розробки

  app.get('/', (req, res) => {
    res.json({
      message: 'Start page!',
    });
  });

  app.use(allRouters);

  app.use('*', notFoundHandler);

  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};
