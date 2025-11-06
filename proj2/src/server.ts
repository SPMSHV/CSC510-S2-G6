/**
 * Copyright (c) 2025 CampusBot Contributors
 * Licensed under the MIT License
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import swaggerUi from 'swagger-ui-express';
import { router as apiRouter } from './web/routes';

export function createServer() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(morgan('dev'));

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'campusbot', time: new Date().toISOString() });
  });

  const apiPrefix = process.env.API_PREFIX || '/api';
  app.use(apiPrefix, apiRouter);

  const docsPath = path.join(process.cwd(), 'docs', 'openapi.yaml');
  if (fs.existsSync(docsPath)) {
    const yaml = require('yaml');
    const file = fs.readFileSync(docsPath, 'utf8');
    const openapiDoc = yaml.parse(file);
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiDoc));
    app.get('/api-docs.json', (_req: Request, res: Response) => res.json(openapiDoc));
  }

  app.get('/', (_req: Request, res: Response) => {
    res.redirect(302, '/api-docs');
  });

  app.use((req: Request, res: Response) => {
    res.status(404).json({ error: 'Not Found', path: req.path });
  });

  return app;
}
