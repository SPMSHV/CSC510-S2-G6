import { Router, Request, Response } from 'express';
import { telemetryService } from '../../services/telemetry';

export const router = Router();

// Snapshot endpoint (JSON)
router.get('/snapshot', (_req: Request, res: Response) => {
  return res.json(telemetryService.getSnapshot());
});

// SSE stream endpoint
router.get('/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  // Immediately send a snapshot
  const send = () => {
    const data = JSON.stringify(telemetryService.getSnapshot());
    res.write(`event: telemetry\n`);
    res.write(`data: ${data}\n\n`);
  };
  send();

  const handler = () => send();
  telemetryService.on('telemetry', handler);

  req.on('close', () => {
    telemetryService.off('telemetry', handler);
    res.end();
  });
});

// Simulated stop command (does not alter core robots API)
router.post('/robots/:id/stop', (req: Request, res: Response) => {
  telemetryService.issueStop(req.params.id);
  return res.status(202).json({ ok: true });
});


