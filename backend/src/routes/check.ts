import { Router, Request, Response } from 'express';
import { detector } from '../detectors';
import { CheckPIIRequest, CheckPIIResponse } from '../schemas';
import { checkLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/check', checkLimiter, (req: Request, res: Response) => {
  try {
    const parsed = CheckPIIRequest.parse(req.body);
    const detections = detector.detect(parsed.text, parsed.detectionTypes);

    const summary = {
      totalFound: detections.length,
      byType: {} as Record<string, number>
    };

    for (const detection of detections) {
      summary.byType[detection.type] = (summary.byType[detection.type] || 0) + 1;
    }

    const response: CheckPIIResponse = {
      hasPII: detections.length > 0,
      detections,
      summary
    };

    res.json(response);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
