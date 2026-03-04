'use server'

import { supabase } from './supabase'

export async function getExamsAndSubjects() {
    const { data: exams, error: examsError } = await supabase
        .from('exam')
        .select('id, name')
        .eq('is_published', true)

    if (examsError) throw examsError

    const { data: subjects, error: subjError } = await supabase
        .from('subject')
        .select('id, exam_id, name')

    if (subjError) throw subjError

    return { exams: exams || [], subjects: subjects || [] }
}

export async function getChaptersAndStats(subjectId: string) {
    // Fetch chapters
    const { data: chapters, error: chpError } = await supabase
        .from('chapter')
        .select('id, name, difficulty, estimated_hours')
        .eq('subject_id', subjectId)

    if (chpError || !chapters) throw chpError

    // Fetch stats for these chapters
    const chapterIds = chapters.map(c => c.id)
    const { data: stats, error: statError } = await supabase
        .from('chapter_stats')
        .select('chapter_id, weightage, frequency, avg_marks')
        .in('chapter_id', chapterIds)

    if (statError) throw statError

    // Merge the two arrays into ChapterData interface
    const result = chapters.map(chap => {
        const stat = stats?.find(s => s.chapter_id === chap.id) || { weightage: 0, frequency: 0, avg_marks: 0 }
        return {
            id: chap.id,
            name: chap.name,
            difficulty: chap.difficulty,
            estimatedHours: chap.estimated_hours,
            weightage: stat.weightage,
            frequency: stat.frequency,
            avgMarks: stat.avg_marks
        }
    })

    return result
}
