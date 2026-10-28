export interface UserProgress {
  completedLessons: string[];
  solvedExercises: string[]; // slugs of lessons where exercise was solved
  quizPassed: boolean;
  quizScore: number;
  miniProjectCompleted: boolean;
  totalXp: number;
  level: number;
}
