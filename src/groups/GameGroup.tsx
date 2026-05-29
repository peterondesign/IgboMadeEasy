import { type ReactElement } from "react";

type GameGroupProps<TLesson, TQuestion> = {
  lesson: TLesson | null;
  question: TQuestion | null;
  renderQuiz: (lesson: TLesson, question: TQuestion) => ReactElement;
};

export default function GameGroup<TLesson, TQuestion>({
  lesson,
  question,
  renderQuiz,
}: GameGroupProps<TLesson, TQuestion>) {
  if (!lesson || !question) {
    return null;
  }

  return renderQuiz(lesson, question);
}
