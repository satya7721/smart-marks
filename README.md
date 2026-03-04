# Smart Marks System (Beta) - JEE Focus

The Smart Marks System is a data-driven chapter recommendation engine designed specifically for **JEE (Joint Entrance Examination)** Aspirants in India. This tool analyzes historical paper weightage and frequency for Physics, Chemistry, and Mathematics to generate a personalized, high-ROI study path based on the student's target marks and available hours.

**Live Site:** [https://smart-marks-jee-beta.netlify.app](https://smart-marks-jee-beta.netlify.app)

## ✨ Features

- **Guest-First Experience:** Jump straight into generating study plans without needing to log in.
- **Data-Driven Algorithm:** Computes an "ROI Score" for every chapter (`MarksScore / EffortScore`) combining historical weightage, frequency, and estimated difficulty.
- **Customizable Targets:** Input your target expected marks and max available hours to limit recommendations.
- **Student Profiling:** Adjusts effort calculations based on whether the student's baseline level is 'Beginner', 'Intermediate', or 'Strong'.
- **Dynamic Visual Insights:**
  - Ranked List showing expected marks and hours per chapter.
  - Interactive Graphs using `recharts` for Cumulative Marks curves and Effort vs. Marks scatter distribution.
- **Aesthetic UI:** Built with Tailwind CSS and Shadcn UI, featuring soft gradient backgrounds, animated floating clouds, and a pure CSS glowing sun.
- **Export Login Gate (Beta):** A placeholder authentication dialog ensuring that PDF or Email exports are gated behind user signup (Phase 5).

## 🛠 Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Styling:** [Tailwind CSS](https://tailwindcss.com/), [Shadcn UI](https://ui.shadcn.com/)
- **Icons & Fonts:** [Lucide React](https://lucide.dev/), Inter (Google Fonts)
- **Charts:** [Recharts](https://recharts.org/)
- **Database:** [Supabase](https://supabase.com/) (PostgreSQL)
- **Testing:** [Vitest](https://vitest.dev/)
- **Deployment:** [Netlify](https://www.netlify.com/)

## 🚀 Getting Started

First, install the dependencies:

```bash
npm install
```

Set up your local environment variables by creating a `.env.local` file in the root directory and adding your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🧪 Testing

The recommendation engine mathematical logic is rigorously tested. Run the test suite using:

```bash
npm run test
```
