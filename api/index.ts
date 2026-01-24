/**
 * Vercel Serverless Function - API Gateway
 * This proxies requests to the NestJS backend
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

// Re-export the serverless handler from Backend
// eslint-disable-next-line @typescript-eslint/no-require-imports
const handler = require('../Backend/api/dist/serverless').default;

export default async function (req: VercelRequest, res: VercelResponse) {
  return handler(req, res);
}
