export type StudentLevel = 'beginner' | 'intermediate' | 'strong';
export type RecommendationMode = 'maxROI' | 'balanced' | 'targetFirst';

export interface ChapterData {
    id: string;
    name: string;
    difficulty: number; // 1-5
    estimatedHours: number;
    weightage: number; // e.g., 0.15 for 15%
    frequency: number; // e.g., out of 100 past papers
    avgMarks: number; // Expected marks from this chapter
}

export interface RecommendationResult extends ChapterData {
    marksScore: number;
    effortScore: number;
    roiScore: number;
    reason: string;
}

const adjustHours = (hours: number, level: StudentLevel): number => {
    switch (level) {
        case 'beginner': return hours * 1.5;
        case 'strong': return hours * 0.8;
        case 'intermediate':
        default: return hours * 1.0;
    }
};

export const generateRecommendations = (
    chapters: ChapterData[],
    targetMin: number,
    targetMax: number,
    availableHours: number | null,
    level: StudentLevel,
    mode: RecommendationMode
): RecommendationResult[] => {
    if (chapters.length === 0) return [];

    const maxFrequency = Math.max(...chapters.map(c => c.frequency)) || 1;
    const maxWeightage = Math.max(...chapters.map(c => c.weightage)) || 1;

    // 1. Calculate base scores
    const scoredChapters: RecommendationResult[] = chapters.map(chapter => {
        // Normalize logic
        const normalizedWeightage = chapter.weightage / maxWeightage;
        const normalizedFrequency = chapter.frequency / maxFrequency;

        const marksScore = normalizedWeightage + normalizedFrequency;

        const adjustedExpectedHours = adjustHours(chapter.estimatedHours, level);
        // effort = difficulty * adjusted_time
        // Add small epsilon to avoid divide by zero
        const effortScore = chapter.difficulty * adjustedExpectedHours || 0.1;

        const roiScore = marksScore / effortScore;

        return {
            ...chapter,
            marksScore,
            effortScore,
            roiScore,
            reason: `Offers good ROI based on ${Math.round(chapter.weightage * 100)}% weightage and ${chapter.difficulty}/5 difficulty.`
        };
    });

    // 2. Sort based on mode
    scoredChapters.sort((a, b) => {
        if (mode === 'maxROI') {
            return b.roiScore - a.roiScore;
        } else if (mode === 'targetFirst') {
            // Prioritize pure marks score (weightage + frequency)
            return b.marksScore - a.marksScore;
        } else { // balanced
            // Combine ROI and Marks
            const scoreA = (a.roiScore * 0.7) + (a.marksScore * 0.3);
            const scoreB = (b.roiScore * 0.7) + (b.marksScore * 0.3);
            return scoreB - scoreA;
        }
    });

    // 3. Filter by constraints
    const finalList: RecommendationResult[] = [];
    let accumulatedMarks = 0;
    let accumulatedHours = 0;

    for (const chapter of scoredChapters) {
        // If we have an hours constraint and adding this chapter exceeds it, skip it
        if (availableHours && (accumulatedHours + adjustHours(chapter.estimatedHours, level)) > availableHours) {
            continue;
        }

        finalList.push(chapter);
        accumulatedMarks += chapter.avgMarks;
        accumulatedHours += adjustHours(chapter.estimatedHours, level);

        // If we hit our target max, we can ideally stop, but maybe we want to provide the full list so graphs look good.
        // The PRD says it returns a list to get to target. We'll mark the cutoff in UI or just return the subset.
        // Actually, returning only up to target max is best to give a minimal list.
        if (accumulatedMarks >= targetMax) {
            break;
        }
    }

    // Update reasons to be more specific based on rank/inclusion
    finalList.forEach((chap, idx) => {
        if (idx === 0) chap.reason = `Top priority! Extremely high return on effort.`;
        else if (chap.difficulty >= 4) chap.reason = `Hard but highly requested in exams.`;
        else chap.reason = `Solid contribution to marks with manageable effort.`;
    });

    return finalList;
};
