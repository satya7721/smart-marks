import { describe, it, expect } from 'vitest';
import { generateRecommendations, ChapterData } from './recommendation';

const sampleChapters: ChapterData[] = [
    { id: '1', name: 'Calculus', difficulty: 5, estimatedHours: 20, weightage: 0.25, frequency: 100, avgMarks: 20.5 },
    { id: '2', name: 'Algebra', difficulty: 3, estimatedHours: 15, weightage: 0.20, frequency: 90, avgMarks: 15.0 },
    { id: '3', name: 'Geometry', difficulty: 4, estimatedHours: 18, weightage: 0.15, frequency: 80, avgMarks: 10.0 },
    { id: '4', name: 'Statistics', difficulty: 2, estimatedHours: 10, weightage: 0.10, frequency: 50, avgMarks: 8.0 },
    { id: '5', name: 'Trigonometry', difficulty: 4, estimatedHours: 12, weightage: 0.15, frequency: 75, avgMarks: 12.0 },
];

describe('Recommendation Engine', () => {
    it('should rank by Max ROI correctly', () => {
        // Algebra has good weightage (0.2) + freq (90), but lower diff (3) and hours (15) -> effort = 45
        // Stat has low marks, but very low effort (2 * 10 = 20)
        const res = generateRecommendations(sampleChapters, 0, 100, null, 'intermediate', 'maxROI');
        expect(res.length).toBe(5);
        // Highest ROI should come first
        expect(res[0].roiScore).toBeGreaterThanOrEqual(res[1].roiScore);
        expect(res[1].roiScore).toBeGreaterThanOrEqual(res[2].roiScore);
    });

    it('should adjust hours based on student level', () => {
        const beginnerRes = generateRecommendations(sampleChapters, 0, 100, null, 'beginner', 'maxROI');
        const strongRes = generateRecommendations(sampleChapters, 0, 100, null, 'strong', 'maxROI');

        // Beginner effort scores should be higher because multiplier is 1.5 vs 0.8
        expect(beginnerRes.find(c => c.id === '1')!.effortScore).toBeGreaterThan(strongRes.find(c => c.id === '1')!.effortScore);
    });

    it('should respect the max target cutoff', () => {
        // We only need to reach targetMax. So we stop adding chapters when accumulatedMarks >= targetMax
        const res = generateRecommendations(sampleChapters, 0, 20, null, 'intermediate', 'maxROI');
        const totalMarks = res.reduce((sum, c) => sum + c.avgMarks, 0);
        // Algebra (15) + Stat (8) = 23. This is >= 20. So it should return those 2.
        // Let's verify it stops once it hits the target
        expect(totalMarks).toBeGreaterThanOrEqual(20);
        // The previous item before this shouldn't have been >= 20.
        const withoutLast = res.slice(0, res.length - 1).reduce((sum, c) => sum + c.avgMarks, 0);
        expect(withoutLast).toBeLessThan(20);
    });

    it('should respect available hours constraint', () => {
        // If we only have 12 hours, Stat (10) can fit, Trig (12) can fit, Algebra (15) cannot.
        const res = generateRecommendations(sampleChapters, 0, 100, 12, 'intermediate', 'maxROI');
        // Algebra is 15h, so it shouldn't be here
        expect(res.find(c => c.name === 'Algebra')).toBeUndefined();
        // Stat is 10h, it can fit alone or Trig is 12h. It will pick one that fits first. 
        // If it picks Stat (10h), passing accumulated hours to 10. Next is Trig (12h). 10+12 = 22 > 12. So only 1 fits.
        expect(res.length).toBe(1);
    });
});
