import { GoalQuiz } from './GoalQuiz';
import type { GoalKey, SplitKey } from '../../data/types';

interface QuizSectionProps {
  onResult: (goal: GoalKey, split: SplitKey) => void;
  isLoggedIn: boolean;
}

export function QuizSection({ onResult, isLoggedIn }: QuizSectionProps) {
  return (
    <div className="lsec" id="quiz-sec">
      <div className="ltag">Not sure where to start?</div>
      <h2 className="lh2">Find your <em>goal.</em></h2>
      <div className="prose">
        <p>You don't need to know what "hypertrophy" means before you start. Answer 3 simple questions and we'll tell you exactly what to focus on — in plain English.</p>
      </div>
      <div className="quiz-wrap" style={{ marginTop: '28px' }}>
        <GoalQuiz
          onResult={onResult}
          ctaLabel={isLoggedIn ? 'Build My Program with This Goal →' : 'Get Started →'}
        />
      </div>
    </div>
  );
}
