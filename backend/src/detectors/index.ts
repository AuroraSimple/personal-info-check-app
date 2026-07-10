import type { PIIDetectionResult } from '../schemas';

export class PIIDetector {
  private patterns = {
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    phone: /(\+\d{1,2}\s?)?(\(\d{3}\)|\d{3})[-.\s]?\d{3}[-.\s]?\d{4}|\d{10}/g,
    ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
    credit_card: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
    name: /\b[A-Z][a-z]+\s[A-Z][a-z]+\b/g
  };

  detect(text: string, types?: string[]): PIIDetectionResult[] {
    const results: PIIDetectionResult[] = [];
    const typesToCheck = types || Object.keys(this.patterns);

    for (const type of typesToCheck) {
      if (!(type in this.patterns)) continue;

      const pattern = this.patterns[type as keyof typeof this.patterns];
      let match;

      while ((match = pattern.exec(text)) !== null) {
        results.push({
          type: type as any,
          value: match[0],
          position: {
            start: match.index,
            end: match.index + match[0].length
          },
          confidence: this.calculateConfidence(type, match[0])
        });
      }
    }

    return results.sort((a, b) => a.position.start - b.position.start);
  }

  private calculateConfidence(type: string, value: string): number {
    const scores: Record<string, number> = {
      email: 0.95,
      phone: 0.85,
      ssn: 0.98,
      credit_card: 0.92,
      name: 0.7
    };
    return scores[type] || 0.8;
  }
}

export const detector = new PIIDetector();
