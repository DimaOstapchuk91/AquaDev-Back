import express from 'express';
import cors from 'cors';
// import pino from 'pino-http';
import cookieParser from 'cookie-parser';
import allRouters from './routers/index.js';
import { env } from './utils/env.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { errorHandler } from './middlewares/errorHandler.js';

const PORT = Number(env('PORT', '3000'));

export const setupServer = () => {
  const app = express();

  app.use(cors());

  app.use(cookieParser());

  //   app.use(
  //     pino({
  //       transport: {
  //         target: 'pino-pretty',
  //       },
  //     }),
  //   );
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
