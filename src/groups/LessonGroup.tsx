import { type ReactElement } from "react";

type LessonGroupProps = {
  screen: string;
  activeLessonTitle: string | null;
  renderLessons: () => ReactElement;
  renderCompleted: (lessonTitle: string) => ReactElement;
};

export default function LessonGroup({
  screen,
  activeLessonTitle,
  renderLessons,
  renderCompleted,
}: LessonGroupProps) {
  if (screen === "completed" && activeLessonTitle != null) {
    return renderCompleted(activeLessonTitle);
  }

  return renderLessons();
}
