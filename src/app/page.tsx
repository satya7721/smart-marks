import { getExamsAndSubjects } from '@/lib/actions'
import { SmartMarksFlow } from '@/components/SmartMarksFlow'

export const revalidate = 3600 // Cache for 1 hour

export default async function Home() {
  const { exams, subjects } = await getExamsAndSubjects()

  return (
    <SmartMarksFlow
      initialExams={exams}
      initialSubjects={subjects}
    />
  )
}
