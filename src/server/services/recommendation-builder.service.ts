import type {
  Recommendation,
  RecommendationPriority
} from '../../types.ts';

export class RecommendationBuilder {

  buildPriority(score: number): RecommendationPriority {

    if (score >= 85) return 'Critical';

    if (score >= 70) return 'High';

    if (score < 50) return 'Low';

    return 'Medium';
  }

}

export const recommendationBuilder = new RecommendationBuilder();
