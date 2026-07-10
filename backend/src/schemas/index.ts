import { z } from 'zod';

export const CheckPIIRequest = z.object({
  text: z.string().min(1, 'Text is required').max(10000, 'Text too long'),
  detectionTypes: z.array(z.enum(['email', 'phone', 'ssn', 'credit_card', 'name'])).optional()
});

export const PIIDetectionResult = z.object({
  type: z.enum(['email', 'phone', 'ssn', 'credit_card', 'name']),
  value: z.string(),
  position: z.object({
    start: z.number(),
    end: z.number()
  }),
  confidence: z.number().min(0).max(1)
});

export const CheckPIIResponse = z.object({
  hasPII: z.boolean(),
  detections: z.array(PIIDetectionResult),
  summary: z.object({
    totalFound: z.number(),
    byType: z.record(z.number())
  })
});

export type CheckPIIRequest = z.infer<typeof CheckPIIRequest>;
export type CheckPIIResponse = z.infer<typeof CheckPIIResponse>;
export type PIIDetectionResult = z.infer<typeof PIIDetectionResult>;
