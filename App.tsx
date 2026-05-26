import AsyncStorage from "@react-native-async-storage/async-storage";
import { type ComponentType, useEffect, useMemo, useState } from "react";
import { StatusBar } from "react-native";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import HeroIllustration from "./assets/hero.svg";
import EyeIcon from "./assets/icons/eye.svg";
import CompletionIllustration from "./assets/illustrations/lesson-complete.svg";

type ScreenName = "home" | "lessons" | "quiz" | "completed";
type FeedbackState = "correct" | "wrong" | null;

type Question = {
  prompt: string;
  answer: string;
  visualKey: string;
};

type Lesson = {
  id: string;
  title: string;
  color: string;
  totalQuestions: number;
  answeredQuestions: number;
};

const STORAGE_KEY = "igbo-made-easy.lesson-progress.v1";

const QUESTION_BANK: Record<string, Question[]> = {
  nouns: [
    { prompt: "Dog", answer: "nkita", visualKey: "nouns-dog" },
    { prompt: "Water", answer: "mmiri", visualKey: "nouns-water" },
    { prompt: "Child", answer: "nwa", visualKey: "nouns-child" },
    { prompt: "Sun", answer: "anyu", visualKey: "nouns-sun" },
    { prompt: "House", answer: "ulo", visualKey: "nouns-house" },
    { prompt: "Road", answer: "uzo", visualKey: "nouns-road" },
    { prompt: "Food", answer: "nri", visualKey: "nouns-food" },
    { prompt: "Book", answer: "akwukwo", visualKey: "nouns-book" },
    { prompt: "Friend", answer: "enyi", visualKey: "nouns-friend" },
    { prompt: "Money", answer: "ego", visualKey: "nouns-money" },
  ],
  pronouns: [
    { prompt: "I", answer: "mu", visualKey: "pronouns-i" },
    { prompt: "You", answer: "gi", visualKey: "pronouns-you" },
    { prompt: "He", answer: "ya", visualKey: "pronouns-he" },
    { prompt: "She", answer: "ya", visualKey: "pronouns-she" },
    { prompt: "We", answer: "anyi", visualKey: "pronouns-we" },
    { prompt: "They", answer: "ha", visualKey: "pronouns-they" },
    { prompt: "Me", answer: "m", visualKey: "pronouns-me" },
    { prompt: "Us", answer: "anyi", visualKey: "pronouns-us" },
    { prompt: "Them", answer: "ha", visualKey: "pronouns-them" },
    { prompt: "My", answer: "m", visualKey: "pronouns-my" },
  ],
  verbs: [
    { prompt: "Eat", answer: "ri", visualKey: "verbs-eat" },
    { prompt: "Go", answer: "ga", visualKey: "verbs-go" },
    { prompt: "Come", answer: "bia", visualKey: "verbs-come" },
    { prompt: "See", answer: "hu", visualKey: "verbs-see" },
    { prompt: "Speak", answer: "kwuo", visualKey: "verbs-speak" },
    { prompt: "Sleep", answer: "ra", visualKey: "verbs-sleep" },
    { prompt: "Read", answer: "guo", visualKey: "verbs-read" },
    { prompt: "Write", answer: "dee", visualKey: "verbs-write" },
    { prompt: "Work", answer: "ruo oru", visualKey: "verbs-work" },
    { prompt: "Play", answer: "gwuo", visualKey: "verbs-play" },
  ],
};

const QUESTION_VISUALS: Record<string, ComponentType<any>> = {
  "nouns-dog": require("./assets/questions/nouns-dog.svg").default,
  "nouns-water": require("./assets/questions/nouns-water.svg").default,
  "nouns-child": require("./assets/questions/nouns-child.svg").default,
  "nouns-sun": require("./assets/questions/nouns-sun.svg").default,
  "nouns-house": require("./assets/questions/nouns-house.svg").default,
  "nouns-road": require("./assets/questions/nouns-road.svg").default,
  "nouns-food": require("./assets/questions/nouns-food.svg").default,
  "nouns-book": require("./assets/questions/nouns-book.svg").default,
  "nouns-friend": require("./assets/questions/nouns-friend.svg").default,
  "nouns-money": require("./assets/questions/nouns-money.svg").default,
  "pronouns-i": require("./assets/questions/pronouns-i.svg").default,
  "pronouns-you": require("./assets/questions/pronouns-you.svg").default,
  "pronouns-he": require("./assets/questions/pronouns-he.svg").default,
  "pronouns-she": require("./assets/questions/pronouns-she.svg").default,
  "pronouns-we": require("./assets/questions/pronouns-we.svg").default,
  "pronouns-they": require("./assets/questions/pronouns-they.svg").default,
  "pronouns-me": require("./assets/questions/pronouns-me.svg").default,
  "pronouns-us": require("./assets/questions/pronouns-us.svg").default,
  "pronouns-them": require("./assets/questions/pronouns-them.svg").default,
  "pronouns-my": require("./assets/questions/pronouns-my.svg").default,
  "verbs-eat": require("./assets/questions/verbs-eat.svg").default,
  "verbs-go": require("./assets/questions/verbs-go.svg").default,
  "verbs-come": require("./assets/questions/verbs-come.svg").default,
  "verbs-see": require("./assets/questions/verbs-see.svg").default,
  "verbs-speak": require("./assets/questions/verbs-speak.svg").default,
  "verbs-sleep": require("./assets/questions/verbs-sleep.svg").default,
  "verbs-read": require("./assets/questions/verbs-read.svg").default,
  "verbs-write": require("./assets/questions/verbs-write.svg").default,
  "verbs-work": require("./assets/questions/verbs-work.svg").default,
  "verbs-play": require("./assets/questions/verbs-play.svg").default,
};

const LESSON_DEFS = [
  { id: "nouns", title: "Nouns", color: "#3B99FF" },
  { id: "pronouns", title: "Pronouns", color: "#5D46D3" },
  { id: "verbs", title: "Verbs", color: "#FF6A1A" },
];

const INITIAL_LESSONS: Lesson[] = LESSON_DEFS.map((lesson) => ({
  ...lesson,
  totalQuestions: QUESTION_BANK[lesson.id].length,
  answeredQuestions: 0,
}));

export default function App() {
  const [screen, setScreen] = useState<ScreenName>("home");
  const [lessons, setLessons] = useState<Lesson[]>(INITIAL_LESSONS);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    const restoreProgress = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (!stored) {
          return;
        }

        const parsed = JSON.parse(stored) as Record<string, number>;
        setLessons((current) =>
          current.map((lesson) => {
            const savedValue = parsed[lesson.id];
            const nextAnswered =
              typeof savedValue === "number"
                ? clamp(savedValue, 0, lesson.totalQuestions)
                : lesson.answeredQuestions;

            return {
              ...lesson,
              answeredQuestions: nextAnswered,
            };
          })
        );
      } catch {
        // Ignore malformed or missing local progress.
      }
    };

    restoreProgress();
  }, []);

  useEffect(() => {
    const payload = Object.fromEntries(
      lessons.map((lesson) => [lesson.id, lesson.answeredQuestions])
    );

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload)).catch(() => {
      // Best effort persistence.
    });
  }, [lessons]);

  const totalAnswered = lessons.reduce(
    (sum, lesson) => sum + lesson.answeredQuestions,
    0
  );
  const totalQuestions = lessons.reduce(
    (sum, lesson) => sum + lesson.totalQuestions,
    0
  );
  const overallProgress = totalQuestions === 0 ? 0 : totalAnswered / totalQuestions;

  const activeLesson =
    activeLessonId == null
      ? null
      : lessons.find((lesson) => lesson.id === activeLessonId) ?? null;

  const activeQuestion = useMemo(() => {
    if (!activeLesson) {
      return null;
    }

    const questions = QUESTION_BANK[activeLesson.id] ?? [];
    if (activeLesson.answeredQuestions >= activeLesson.totalQuestions) {
      return null;
    }

    const questionIndex = clamp(
      activeLesson.answeredQuestions,
      0,
      Math.max(questions.length - 1, 0)
    );

    return questions[questionIndex] ?? null;
  }, [activeLesson]);

  const startLesson = (lessonId: string) => {
    const lesson = lessons.find((item) => item.id === lessonId);

    setActiveLessonId(lessonId);
    setUserAnswer("");
    setFeedback(null);
    setShowAnswer(false);
    setScreen(
      lesson && lesson.answeredQuestions >= lesson.totalQuestions
        ? "completed"
        : "quiz"
    );
  };

  const closeQuiz = () => {
    setScreen("lessons");
    setActiveLessonId(null);
    setUserAnswer("");
    setFeedback(null);
    setShowAnswer(false);
  };

  const restartActiveLesson = () => {
    if (!activeLessonId) {
      return;
    }

    setLessons((currentLessons) =>
      currentLessons.map((lesson) =>
        lesson.id === activeLessonId ? { ...lesson, answeredQuestions: 0 } : lesson
      )
    );

    setUserAnswer("");
    setFeedback(null);
    setShowAnswer(false);
    setScreen("quiz");
  };

  const continueToAnotherLesson = () => {
    setScreen("lessons");
    setActiveLessonId(null);
    setUserAnswer("");
    setFeedback(null);
    setShowAnswer(false);
  };

  const checkCurrentAnswer = () => {
    if (!activeQuestion) {
      return;
    }

    const normalizedInput = normalizeAnswer(userAnswer);
    const normalizedExpected = normalizeAnswer(activeQuestion.answer);
    setFeedback(normalizedInput === normalizedExpected ? "correct" : "wrong");
  };

  const continueFromFeedback = () => {
    if (!activeLessonId || feedback == null) {
      return;
    }

    if (feedback === "correct") {
      const lessonBeforeUpdate = lessons.find(
        (lesson) => lesson.id === activeLessonId
      );

      if (!lessonBeforeUpdate) {
        setFeedback(null);
        return;
      }

      const nextAnswered = Math.min(
        lessonBeforeUpdate.answeredQuestions + 1,
        lessonBeforeUpdate.totalQuestions
      );
      const completedLesson = nextAnswered >= lessonBeforeUpdate.totalQuestions;

      setLessons((currentLessons) =>
        currentLessons.map((lesson) => {
          if (lesson.id !== activeLessonId) {
            return lesson;
          }

          return {
            ...lesson,
            answeredQuestions: nextAnswered,
          };
        })
      );

      setUserAnswer("");
      setShowAnswer(false);
      setFeedback(null);

      if (completedLesson) {
        setScreen("completed");
      }
    } else {
      setFeedback(null);
    }
  };

  if (screen === "lessons") {
    return (
      <LessonsScreen
        onBack={() => setScreen("home")}
        lessons={lessons}
        overallProgress={overallProgress}
        onStartLesson={startLesson}
      />
    );
  }

  if (screen === "completed" && activeLesson != null) {
    return (
      <CompletedLessonScreen
        lessonTitle={activeLesson.title}
        onRestart={restartActiveLesson}
        onContinue={continueToAnotherLesson}
      />
    );
  }

  if (screen === "quiz" && activeLesson != null && activeQuestion != null) {
    return (
      <QuizScreen
        lesson={activeLesson}
        question={activeQuestion}
        userAnswer={userAnswer}
        onAnswerChange={setUserAnswer}
        onBack={closeQuiz}
        onCheckAnswer={checkCurrentAnswer}
        feedback={feedback}
        onContinue={continueFromFeedback}
        showAnswer={showAnswer}
        onToggleShowAnswer={() => setShowAnswer((state) => !state)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#111111" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.homeContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Learn Igbo{"\n"}for free</Text>
          <Text style={styles.subtitle}>
            Igbo lessons, pronunciation, and daily practice.
          </Text>
        </View>

        <View style={styles.heroWrap}>
          <HeroIllustration width="100%" height="100%" />
        </View>

        <Pressable
          style={styles.button}
          accessibilityRole="button"
          onPress={() => setScreen("lessons")}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function LessonsScreen({
  onBack,
  lessons,
  overallProgress,
  onStartLesson,
}: {
  onBack: () => void;
  lessons: Lesson[];
  overallProgress: number;
  onStartLesson: (lessonId: string) => void;
}) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#111111" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.lessonsContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.lessonsTopRow}>
          <Pressable
            onPress={onBack}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>

          <View style={styles.progressRing}>
            <Text style={styles.progressText}>{toPercent(overallProgress)}%</Text>
          </View>
        </View>

        <Text style={styles.lessonsTitle}>Lessons</Text>

        <View style={styles.lessonList}>
          {lessons.map((lesson) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              onStart={() => onStartLesson(lesson.id)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function QuizScreen({
  lesson,
  question,
  userAnswer,
  onAnswerChange,
  onBack,
  onCheckAnswer,
  feedback,
  onContinue,
  showAnswer,
  onToggleShowAnswer,
}: {
  lesson: Lesson;
  question: Question;
  userAnswer: string;
  onAnswerChange: (value: string) => void;
  onBack: () => void;
  onCheckAnswer: () => void;
  feedback: FeedbackState;
  onContinue: () => void;
  showAnswer: boolean;
  onToggleShowAnswer: () => void;
}) {
  const progress =
    lesson.totalQuestions === 0
      ? 0
      : lesson.answeredQuestions / lesson.totalQuestions;
  const hasInput = userAnswer.trim().length > 0;
  const QuestionVisual = QUESTION_VISUALS[question.visualKey];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#111111" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.quizFlowContent}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={onBack}
          style={styles.quizBackIconButton}
          accessibilityRole="button"
          accessibilityLabel="Back to lessons"
        >
          <Text style={styles.quizBackIcon}>‹</Text>
        </Pressable>

        <View style={styles.quizHeaderProgressTrack}>
          <View
            style={[styles.quizHeaderProgressFill, { width: `${progress * 100}%` }]}
          />
        </View>

        <View style={styles.quizPromptRow}>
          <Text style={styles.quizPromptWord}>{question.prompt}</Text>
          <Pressable
            onPress={onToggleShowAnswer}
            style={styles.revealButton}
            accessibilityRole="button"
            accessibilityLabel="Toggle answer hint"
          >
            <EyeIcon width={52} height={52} />
          </Pressable>
        </View>

        <View style={styles.quizVisualWrap}>
          {QuestionVisual ? (
            <QuestionVisual width="100%" height="100%" />
          ) : (
            <Text style={styles.quizVisualFallback}>No visual</Text>
          )}
        </View>

        <View style={styles.answerInputWrap}>
          <TextInput
            value={userAnswer}
            onChangeText={onAnswerChange}
            style={styles.answerInput}
            placeholder="Type Igbo translation"
            placeholderTextColor="#617588"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <View style={styles.answerLine} />
          <View style={styles.answerLine} />
        </View>

        {showAnswer && <Text style={styles.hintText}>Hint: {question.answer}</Text>}

        {hasInput && feedback == null && (
          <Pressable
            style={styles.checkButton}
            accessibilityRole="button"
            onPress={onCheckAnswer}
          >
            <Text style={styles.checkButtonText}>Check</Text>
          </Pressable>
        )}
      </ScrollView>

      {feedback != null && (
        <View
          style={[
            styles.feedbackSheet,
            feedback === "correct"
              ? styles.feedbackSheetCorrect
              : styles.feedbackSheetWrong,
          ]}
        >
          <View style={styles.feedbackHeader}>
            <View
              style={[
                styles.feedbackIconCircle,
                feedback === "correct"
                  ? styles.feedbackIconCircleCorrect
                  : styles.feedbackIconCircleWrong,
              ]}
            >
              <Text style={styles.feedbackIconText}>
                {feedback === "correct" ? "✓" : "✕"}
              </Text>
            </View>
            <Text
              style={[
                styles.feedbackTitle,
                feedback === "correct"
                  ? styles.feedbackTitleCorrect
                  : styles.feedbackTitleWrong,
              ]}
            >
              {feedback === "correct" ? "Correct" : "Incorrect"}
            </Text>
          </View>

          <Pressable
            style={[
              styles.feedbackAction,
              feedback === "correct"
                ? styles.feedbackActionCorrect
                : styles.feedbackActionWrong,
            ]}
            onPress={onContinue}
            accessibilityRole="button"
          >
            <Text style={styles.feedbackActionText}>
              {feedback === "correct" ? "Continue" : "Got it"}
            </Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

function CompletedLessonScreen({
  lessonTitle,
  onRestart,
  onContinue,
}: {
  lessonTitle: string;
  onRestart: () => void;
  onContinue: () => void;
}) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#111111" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.completedContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.completedTitle}>You completed this lesson</Text>
        <Text style={styles.completedSubtitle}>{lessonTitle}</Text>

        <View style={styles.completedIllustrationWrap}>
          <CompletionIllustration width="100%" height="100%" />
        </View>

        <Pressable style={styles.restartButton} onPress={onRestart}>
          <Text style={styles.restartButtonText}>Restart</Text>
        </Pressable>

        <Pressable style={styles.continueButton} onPress={onContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function LessonCard({
  lesson,
  onStart,
}: {
  lesson: Lesson;
  onStart: () => void;
}) {
  const progress =
    lesson.totalQuestions === 0
      ? 0
      : lesson.answeredQuestions / lesson.totalQuestions;

  return (
    <Pressable
      style={[styles.lessonCard, { backgroundColor: lesson.color }]}
      onPress={onStart}
      accessibilityRole="button"
      accessibilityLabel={`Start ${lesson.title} lesson`}
    >
      <View style={styles.lessonCardHeader}>
        <Text style={styles.lessonCardTitle}>{lesson.title}</Text>
        <Text style={styles.lessonCardMeta}>
          {lesson.answeredQuestions}/{lesson.totalQuestions} • {toPercent(progress)}%
        </Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>
      <Text style={styles.lessonStartText}>Tap to start</Text>
    </Pressable>
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

function normalizeAnswer(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function toPercent(value: number): number {
  return Math.round(value * 100);
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0D0F14",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#0D0F14",
  },
  homeContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginTop: 24,
    gap: 14,
  },
  title: {
    color: "#F7F7F7",
    textAlign: "center",
    fontSize: 56,
    lineHeight: 60,
    fontWeight: "800",
    letterSpacing: -1.6,
  },
  subtitle: {
    color: "#B8B8B8",
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 310,
  },
  heroWrap: {
    width: "100%",
    aspectRatio: 0.88,
    maxWidth: 560,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    width: "100%",
    maxWidth: 560,
    minHeight: 88,
    borderRadius: 28,
    backgroundColor: "#55BFF2",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  buttonText: {
    color: "#111111",
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "800",
    letterSpacing: -0.8,
  },
  lessonsContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 28,
  },
  lessonsTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  backButton: {
    minWidth: 72,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  backButtonText: {
    color: "#7E8A92",
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "400",
    letterSpacing: -0.4,
  },
  lessonsTitle: {
    color: "#8A8A8A",
    fontSize: 46,
    lineHeight: 52,
    fontWeight: "300",
    letterSpacing: -1.1,
    marginBottom: 40,
  },
  progressRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: "rgba(135, 149, 160, 0.7)",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  progressText: {
    color: "#FFFFFF",
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "800",
  },
  lessonList: {
    gap: 28,
    paddingTop: 4,
  },
  lessonCard: {
    minHeight: 200,
    borderRadius: 28,
    paddingHorizontal: 28,
    paddingTop: 42,
    paddingBottom: 28,
    justifyContent: "space-between",
  },
  lessonCardHeader: {
    gap: 8,
    alignItems: "center",
  },
  lessonCardTitle: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 44,
    lineHeight: 50,
    fontWeight: "800",
  },
  lessonCardMeta: {
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "600",
  },
  progressTrack: {
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(255, 255, 255, 0.28)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 11,
    backgroundColor: "rgba(255, 255, 255, 0.55)",
  },
  lessonStartText: {
    color: "rgba(255, 255, 255, 0.88)",
    textAlign: "center",
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "600",
  },
  quizFlowContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 26,
    paddingBottom: 260,
  },
  quizBackIconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  quizBackIcon: {
    color: "#8E969C",
    fontSize: 54,
    lineHeight: 54,
    marginTop: -10,
  },
  quizHeaderProgressTrack: {
    height: 46,
    borderRadius: 23,
    marginTop: 40,
    backgroundColor: "#3A4B58",
    overflow: "hidden",
  },
  quizHeaderProgressFill: {
    height: "100%",
    borderRadius: 23,
    backgroundColor: "#9CD754",
  },
  quizPromptRow: {
    marginTop: 86,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  quizPromptWord: {
    color: "#FFFFFF",
    fontSize: 64,
    lineHeight: 70,
    fontWeight: "700",
  },
  revealButton: {
    width: 98,
    height: 98,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#54BBF3",
  },
  quizVisualWrap: {
    marginTop: 70,
    height: 250,
    width: "100%",
  },
  quizVisualFallback: {
    color: "#8AA0B8",
    textAlign: "center",
    fontSize: 22,
    lineHeight: 28,
    marginTop: 100,
  },
  answerInputWrap: {
    marginTop: 64,
    gap: 34,
  },
  answerInput: {
    color: "#E7F7FF",
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "500",
    paddingVertical: 0,
  },
  answerLine: {
    height: 4,
    borderRadius: 2,
    backgroundColor: "#4EC5FF",
  },
  hintText: {
    marginTop: 26,
    color: "#8BD0FF",
    fontSize: 22,
    lineHeight: 30,
    fontWeight: "600",
  },
  checkButton: {
    marginTop: 34,
    minHeight: 84,
    borderRadius: 26,
    backgroundColor: "#3CC1FF",
    alignItems: "center",
    justifyContent: "center",
  },
  checkButtonText: {
    color: "#0C1721",
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "800",
  },
  feedbackSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  feedbackSheetCorrect: {
    backgroundColor: "#BEE3A6",
  },
  feedbackSheetWrong: {
    backgroundColor: "#E0C8CA",
  },
  feedbackHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    marginBottom: 24,
  },
  feedbackIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  feedbackIconCircleCorrect: {
    backgroundColor: "#39A600",
  },
  feedbackIconCircleWrong: {
    backgroundColor: "#EF2C33",
  },
  feedbackIconText: {
    color: "#FFFFFF",
    fontSize: 44,
    lineHeight: 48,
    fontWeight: "700",
  },
  feedbackTitle: {
    fontSize: 56,
    lineHeight: 62,
    fontWeight: "700",
  },
  feedbackTitleCorrect: {
    color: "#33980C",
  },
  feedbackTitleWrong: {
    color: "#EA2E35",
  },
  feedbackAction: {
    minHeight: 88,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  feedbackActionCorrect: {
    backgroundColor: "#56CD00",
  },
  feedbackActionWrong: {
    backgroundColor: "#FF4B54",
  },
  feedbackActionText: {
    color: "#FFFFFF",
    fontSize: 64,
    lineHeight: 70,
    fontWeight: "700",
  },
  completedContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 42,
    paddingBottom: 48,
  },
  completedTitle: {
    color: "#F7F7F7",
    textAlign: "center",
    fontSize: 68,
    lineHeight: 74,
    fontWeight: "800",
    letterSpacing: -1.3,
    maxWidth: 520,
  },
  completedSubtitle: {
    marginTop: 16,
    color: "#7BCDF8",
    textAlign: "center",
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "600",
  },
  completedIllustrationWrap: {
    width: "100%",
    maxWidth: 560,
    height: 320,
    marginTop: 24,
    marginBottom: 34,
  },
  restartButton: {
    width: "100%",
    maxWidth: 560,
    minHeight: 88,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "#48C0F7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  restartButtonText: {
    color: "#48C0F7",
    fontSize: 48,
    lineHeight: 54,
    fontWeight: "700",
  },
  continueButton: {
    width: "100%",
    maxWidth: 560,
    minHeight: 88,
    borderRadius: 28,
    backgroundColor: "#48B8EE",
    alignItems: "center",
    justifyContent: "center",
  },
  continueButtonText: {
    color: "#0F1A22",
    fontSize: 48,
    lineHeight: 54,
    fontWeight: "700",
  },
});
