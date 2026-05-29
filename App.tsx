import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DMSans_400Regular,
  DMSans_700Bold,
  useFonts,
} from "@expo-google-fonts/dm-sans";
import { createAudioPlayer, setAudioModeAsync } from "expo-audio";
import {
  type ComponentType,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { StatusBar } from "react-native";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  Modal,
} from "react-native";
import BackIcon from "./assets/icons/back-icon.svg";
import HintIcon from "./assets/icons/hint-icon.svg";
import SpeakerIcon from "./assets/icons/speaker-icon.svg";
import CompletionIllustration from "./assets/illustrations/lesson-complete.svg";
import FireIllustration from "./assets/illustrations/fire.svg";
import PlantIllustration from "./assets/illustrations/plant.svg";
import {
  EVERYDAY_VERBS_AUDIO,
  EVERYDAY_VERBS_ENTRIES,
} from "./src/data/everydayVerbsAudio";
import { GREETINGS_AUDIO, GREETINGS_PHRASES } from "./src/data/greetingsAudio";
import GameGroup from "./src/groups/GameGroup";
import HomeGroup from "./src/groups/HomeGroup";
import LessonGroup from "./src/groups/LessonGroup";

type ScreenName = "home" | "lessons" | "quiz" | "completed";
type AppGroup = "home" | "lesson" | "game";
type FeedbackState = "correct" | "wrong" | null;

type Question = {
  prompt: string;
  answer: string;
  visualKey: string;
  audioKey?: string;
  sentenceBuilder?: {
    sourceSentence: string;
    targetWords: string[];
    bankWords: string[];
  };
};

type SentenceBuilderSeed = {
  sourceSentence: string;
  targetWords: string[];
  distractors: string[];
};

type ChoiceOption = {
  label: string;
  translation: string;
};

type Lesson = {
  id: string;
  title: string;
  totalQuestions: number;
  answeredQuestions: number;
  completedOn: string | null;
};

type PersistedProgress = {
  answeredByLesson: Record<string, number>;
  completedOnByLesson: Record<string, string | null>;
};

const STORAGE_KEY = "igbo-made-easy.lesson-progress.v1";
const GREETINGS_TRANSLATIONS = require("./assets/audio/greetings/translations.json") as Record<
  string,
  string
>;
const GAME_SOUND_SUCCESS = require("./assets/audio/game-sounds/success-sound.m4a");
const GAME_SOUND_FAILURE = require("./assets/audio/game-sounds/try-again-sound.m4a");
const QUESTION_AUDIO: Record<string, number> = {
  ...GREETINGS_AUDIO,
  ...EVERYDAY_VERBS_AUDIO,
};

const WORD_QUESTION_BANK: Record<string, Question[]> = {
  greetings: GREETINGS_PHRASES.map((phrase) => ({
    prompt: "What do you hear?",
    answer: phrase,
    visualKey: "",
    audioKey: phrase,
  })),
  "everyday-verbs": EVERYDAY_VERBS_ENTRIES.map((entry) => ({
    prompt: entry.english,
    answer: entry.igbo,
    visualKey: "",
    audioKey: EVERYDAY_VERBS_AUDIO[entry.igbo] ? entry.igbo : undefined,
  })),
  "asking-questions": [
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
  "family-people": [
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
  "food-cooking": [
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
};

const SENTENCE_BUILDER_BANK: Record<string, SentenceBuilderSeed[]> = {
  greetings: buildGreetingSentenceSeeds(),
  "everyday-verbs": buildSentenceSeedsFromEntries(EVERYDAY_VERBS_ENTRIES),
  "asking-questions": [
    {
      sourceSentence: "The dog is happy.",
      targetWords: ["nkita", "di", "uto"],
      distractors: ["mmiri", "ulo", "enyi"],
    },
    {
      sourceSentence: "The child has water.",
      targetWords: ["nwa", "nwere", "mmiri"],
      distractors: ["ego", "uzo", "nri"],
    },
    {
      sourceSentence: "The house is big.",
      targetWords: ["ulo", "di", "ukwu"],
      distractors: ["nwa", "anyi", "akwukwo"],
    },
    {
      sourceSentence: "My friend has money.",
      targetWords: ["enyi", "m", "nwere", "ego"],
      distractors: ["mmiri", "ulo", "ha"],
    },
    {
      sourceSentence: "The road has food stalls.",
      targetWords: ["uzo", "nwere", "nri"],
      distractors: ["nkita", "anya", "enyi"],
    },
  ],
  "family-people": [
    {
      sourceSentence: "I can see you.",
      targetWords: ["mu", "na", "ahu", "gi"],
      distractors: ["ha", "nri", "ulo"],
    },
    {
      sourceSentence: "We are friends.",
      targetWords: ["anyi", "bu", "enyi"],
      distractors: ["ego", "mmiri", "nwa"],
    },
    {
      sourceSentence: "They are here.",
      targetWords: ["ha", "no", "ebe", "a"],
      distractors: ["ulo", "bia", "enyi"],
    },
    {
      sourceSentence: "She is with us.",
      targetWords: ["ya", "no", "na", "anyi"],
      distractors: ["gi", "ha", "aku"],
    },
    {
      sourceSentence: "You and me.",
      targetWords: ["gi", "na", "m"],
      distractors: ["ha", "nwa", "ulo"],
    },
  ],
  "food-cooking": [
    {
      sourceSentence: "The food is ready.",
      targetWords: ["nri", "adi", "njikere"],
      distractors: ["mmiri", "ulo", "ego"],
    },
    {
      sourceSentence: "The child is eating.",
      targetWords: ["nwa", "na", "eri"],
      distractors: ["ha", "ahu", "akwukwo"],
    },
    {
      sourceSentence: "Water is in the house.",
      targetWords: ["mmiri", "di", "na", "ulo"],
      distractors: ["enyi", "ego", "nri"],
    },
    {
      sourceSentence: "Bring food here.",
      targetWords: ["weta", "nri", "ebe", "a"],
      distractors: ["ga", "ha", "nwa"],
    },
    {
      sourceSentence: "My friend cooked food.",
      targetWords: ["enyi", "m", "siri", "nri"],
      distractors: ["ulo", "ego", "gi"],
    },
  ],
};

const QUESTION_BANK: Record<string, Question[]> = {
  greetings: buildMixedQuestionSet(
    WORD_QUESTION_BANK.greetings,
    SENTENCE_BUILDER_BANK.greetings
  ),
  "everyday-verbs": buildMixedQuestionSet(
    WORD_QUESTION_BANK["everyday-verbs"],
    SENTENCE_BUILDER_BANK["everyday-verbs"]
  ),
  "asking-questions": buildMixedQuestionSet(
    WORD_QUESTION_BANK["asking-questions"],
    SENTENCE_BUILDER_BANK["asking-questions"]
  ),
  "family-people": buildMixedQuestionSet(
    WORD_QUESTION_BANK["family-people"],
    SENTENCE_BUILDER_BANK["family-people"]
  ),
  "food-cooking": buildMixedQuestionSet(
    WORD_QUESTION_BANK["food-cooking"],
    SENTENCE_BUILDER_BANK["food-cooking"]
  ),
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
  { id: "greetings", title: "Greetings" },
  { id: "everyday-verbs", title: "Everyday Verbs" },
  { id: "asking-questions", title: "Asking Questions" },
  { id: "family-people", title: "Family and People" },
  { id: "food-cooking", title: "Food and Cooking" },
];

const AUDIO_READY_LESSON_IDS = new Set<string>(["greetings", "everyday-verbs"]);

const ACTIVE_QUESTION_BANK: Record<string, Question[]> = Object.fromEntries(
  Object.entries(QUESTION_BANK).map(([lessonId, questions]) => [
    lessonId,
    AUDIO_READY_LESSON_IDS.has(lessonId) ? questions : [],
  ])
) as Record<string, Question[]>;

const INITIAL_LESSONS: Lesson[] = LESSON_DEFS.map((lesson) => ({
  ...lesson,
  totalQuestions: ACTIVE_QUESTION_BANK[lesson.id].length,
  answeredQuestions: 0,
  completedOn: null,
}));

export default function App() {
  const [fontsLoaded] = useFonts({ DMSans_400Regular, DMSans_700Bold });
  const [screen, setScreen] = useState<ScreenName>("home");
  const [lessons, setLessons] = useState<Lesson[]>(INITIAL_LESSONS);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [isHintModalOpen, setIsHintModalOpen] = useState(false);
  const [audioPlaybackRate, setAudioPlaybackRate] = useState<0.25 | 1>(1);
  const activePlayerRef = useRef<ReturnType<typeof createAudioPlayer> | null>(
    null
  );
  const feedbackPlayerRef = useRef<ReturnType<typeof createAudioPlayer> | null>(
    null
  );

  useEffect(() => {
    const restoreProgress = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (!stored) {
          return;
        }

        const parsed = JSON.parse(stored) as unknown;

        const answeredByLesson: Record<string, number> = isPersistedProgress(
          parsed
        )
          ? parsed.answeredByLesson
          : (parsed as Record<string, number>);
        const completedOnByLesson: Record<string, string | null> =
          isPersistedProgress(parsed) ? parsed.completedOnByLesson : {};

        setLessons((current) =>
          current.map((lesson) => {
            const savedValue = answeredByLesson[lesson.id];
            const nextAnswered =
              typeof savedValue === "number"
                ? clamp(savedValue, 0, lesson.totalQuestions)
                : lesson.answeredQuestions;
            const savedCompletedOn = completedOnByLesson[lesson.id];

            return {
              ...lesson,
              answeredQuestions: nextAnswered,
              completedOn:
                typeof savedCompletedOn === "string" ? savedCompletedOn : null,
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
    const payload: PersistedProgress = {
      answeredByLesson: Object.fromEntries(
        lessons.map((lesson) => [lesson.id, lesson.answeredQuestions])
      ),
      completedOnByLesson: Object.fromEntries(
        lessons.map((lesson) => [lesson.id, lesson.completedOn])
      ),
    };

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
  const todayKey = getTodayKey();
  const streakCount = lessons.some((lesson) => lesson.completedOn === todayKey)
    ? 1
    : 0;

  const activeLesson =
    activeLessonId == null
      ? null
      : lessons.find((lesson) => lesson.id === activeLessonId) ?? null;

  const activeQuestion = useMemo(() => {
    if (!activeLesson) {
      return null;
    }

    const questions = ACTIVE_QUESTION_BANK[activeLesson.id] ?? [];
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

  const hintEntries = useMemo(() => {
    if (activeLessonId !== "greetings") {
      return [];
    }

    return GREETINGS_PHRASES.map((word) => ({
      word,
      meaning: GREETINGS_TRANSLATIONS[word] ?? "Translation pending",
    }));
  }, [activeLessonId]);

  const activeChoices = useMemo(() => {
    if (!activeLessonId || !activeQuestion || activeQuestion.sentenceBuilder) {
      return [];
    }

    return buildLessonChoices(activeLessonId, activeQuestion);
  }, [activeLessonId, activeQuestion]);

  useEffect(() => {
    return () => {
      if (activePlayerRef.current) {
        activePlayerRef.current.remove();
        activePlayerRef.current = null;
      }

      if (feedbackPlayerRef.current) {
        feedbackPlayerRef.current.remove();
        feedbackPlayerRef.current = null;
      }
    };
  }, []);

  const toggleAudioPlaybackRate = useCallback(() => {
    setAudioPlaybackRate((currentRate) => {
      const nextRate: 0.25 | 1 = currentRate === 1 ? 0.25 : 1;

      if (activePlayerRef.current) {
        activePlayerRef.current.setPlaybackRate(nextRate);
      }

      return nextRate;
    });
  }, []);

  const playFeedbackSound = useCallback(async (state: Exclude<FeedbackState, null>) => {
    const sound = state === "correct" ? GAME_SOUND_SUCCESS : GAME_SOUND_FAILURE;

    try {
      if (feedbackPlayerRef.current) {
        feedbackPlayerRef.current.remove();
        feedbackPlayerRef.current = null;
      }

      await setAudioModeAsync({
        playsInSilentMode: true,
        interruptionMode: "mixWithOthers",
      });

      const player = createAudioPlayer(sound, { keepAudioSessionActive: true });
      feedbackPlayerRef.current = player;
      player.play();
    } catch {
      // Ignore feedback sound errors.
    }
  }, []);

  const startLesson = (lessonId: string) => {
    const lesson = lessons.find((item) => item.id === lessonId);

    if (!lesson || lesson.totalQuestions === 0) {
      return;
    }

    setActiveLessonId(lessonId);
    setUserAnswer("");
    setFeedback(null);
    setIsHintModalOpen(false);
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
    setIsHintModalOpen(false);
  };

  const restartActiveLesson = () => {
    if (!activeLessonId) {
      return;
    }

    setLessons((currentLessons) =>
      currentLessons.map((lesson) =>
        lesson.id === activeLessonId
          ? { ...lesson, answeredQuestions: 0, completedOn: null }
          : lesson
      )
    );

    setUserAnswer("");
    setFeedback(null);
    setIsHintModalOpen(false);
    setScreen("quiz");
  };

  const continueToAnotherLesson = () => {
    setScreen("lessons");
    setActiveLessonId(null);
    setUserAnswer("");
    setFeedback(null);
    setIsHintModalOpen(false);
  };

  const playActiveAudio = useCallback(async () => {
    if (!activeQuestion?.audioKey) {
      return;
    }

    const clip = QUESTION_AUDIO[activeQuestion.audioKey];
    if (!clip) {
      return;
    }

    try {
      if (activePlayerRef.current) {
        activePlayerRef.current.remove();
        activePlayerRef.current = null;
      }

      await setAudioModeAsync({
        playsInSilentMode: true,
        interruptionMode: "mixWithOthers",
      });

      const player = createAudioPlayer(clip, { keepAudioSessionActive: true });
      activePlayerRef.current = player;
      player.setPlaybackRate(audioPlaybackRate);
      player.play();
    } catch {
      // Ignore audio playback errors.
    }
  }, [activeQuestion, audioPlaybackRate]);

  const checkCurrentAnswer = () => {
    if (!activeQuestion) {
      return;
    }

    const normalizedInput = normalizeAnswer(userAnswer);
    const normalizedExpected = normalizeAnswer(activeQuestion.answer);
    const nextFeedback: FeedbackState =
      normalizedInput === normalizedExpected ? "correct" : "wrong";
    setFeedback(nextFeedback);

    if (nextFeedback) {
      void playFeedbackSound(nextFeedback);
    }
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
            completedOn: completedLesson ? todayKey : lesson.completedOn,
          };
        })
      );

      setUserAnswer("");
      setIsHintModalOpen(false);
      setFeedback(null);

      if (completedLesson) {
        setScreen("completed");
      }
    } else {
      setFeedback(null);
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  const currentGroup: AppGroup =
    screen === "home" ? "home" : screen === "quiz" ? "game" : "lesson";

  if (currentGroup === "home") {
    return <HomeGroup onGetStarted={() => setScreen("lessons")} styles={styles} />;
  }

  if (currentGroup === "lesson") {
    return (
      <LessonGroup
        screen={screen}
        activeLessonTitle={activeLesson?.title ?? null}
        renderLessons={() => (
          <LessonsScreen
            lessons={lessons}
            overallProgress={overallProgress}
            streakCount={streakCount}
            onStartLesson={startLesson}
          />
        )}
        renderCompleted={(lessonTitle) => (
          <CompletedLessonScreen
            lessonTitle={lessonTitle}
            onRestart={restartActiveLesson}
            onContinue={continueToAnotherLesson}
          />
        )}
      />
    );
  }

  if (currentGroup === "game" && activeLesson != null && activeQuestion != null) {
    return (
      <GameGroup
        lesson={activeLesson}
        question={activeQuestion}
        renderQuiz={(lesson, question) => (
          <QuizScreen
            lesson={lesson}
            question={question}
            userAnswer={userAnswer}
            onAnswerChange={setUserAnswer}
            onBack={closeQuiz}
            onCheckAnswer={checkCurrentAnswer}
            feedback={feedback}
            onContinue={continueFromFeedback}
            showSpeaker={Boolean(question.audioKey)}
            onPlayAudio={playActiveAudio}
            audioPlaybackRate={audioPlaybackRate}
            onToggleAudioPlaybackRate={toggleAudioPlaybackRate}
            isHintModalOpen={isHintModalOpen}
            onOpenHint={() => setIsHintModalOpen(true)}
            onCloseHint={() => setIsHintModalOpen(false)}
            hintEntries={hintEntries}
            choices={activeChoices}
          />
        )}
      />
    );
  }

  return (
    <LessonsScreen
      lessons={lessons}
      overallProgress={overallProgress}
      streakCount={streakCount}
      onStartLesson={startLesson}
    />
  );
}

function LessonsScreen({
  lessons,
  overallProgress,
  streakCount,
  onStartLesson,
}: {
  lessons: Lesson[];
  overallProgress: number;
  streakCount: number;
  onStartLesson: (lessonId: string) => void;
}) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#111111" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.lessonsContent}
        stickyHeaderIndices={[0]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.lessonsHeaderRow}>
          <View style={styles.metricWrap}>
            <FireIllustration width={20} height={20} />
            <Text style={styles.metricText}>{streakCount}</Text>
          </View>

          <View style={styles.lessonsHeaderCenter}>
            <Image
              source={require("./assets/illustrations/logo-with-text.png")}
              style={styles.lessonsHeaderLogo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.metricWrap}>
            <PlantIllustration width={20} height={20} />
            <Text style={styles.metricText}>{toPercent(overallProgress)}%</Text>
          </View>
        </View>

        <View style={styles.lessonList}>
          {lessons.map((lesson, index) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              lessonNumber={index + 1}
              isLocked={lesson.totalQuestions === 0}
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
  showSpeaker,
  onPlayAudio,
  audioPlaybackRate,
  onToggleAudioPlaybackRate,
  isHintModalOpen,
  onOpenHint,
  onCloseHint,
  hintEntries,
  choices,
}: {
  lesson: Lesson;
  question: Question;
  userAnswer: string;
  onAnswerChange: (value: string) => void;
  onBack: () => void;
  onCheckAnswer: () => void;
  feedback: FeedbackState;
  onContinue: () => void;
  showSpeaker: boolean;
  onPlayAudio: () => void;
  audioPlaybackRate: 0.25 | 1;
  onToggleAudioPlaybackRate: () => void;
  isHintModalOpen: boolean;
  onOpenHint: () => void;
  onCloseHint: () => void;
  hintEntries: Array<{ word: string; meaning: string }>;
  choices: ChoiceOption[];
}) {
  const progress =
    lesson.totalQuestions === 0
      ? 0
      : lesson.answeredQuestions / lesson.totalQuestions;
  const isSentenceBuilder = question.sentenceBuilder != null;
  const [slottedWords, setSlottedWords] = useState<string[]>([]);
  const [dragFromIndex, setDragFromIndex] = useState<number | null>(null);

  const sentenceBuilder = question.sentenceBuilder;
  const sentenceTargetWords = sentenceBuilder?.targetWords ?? [];
  const sentenceBankWords = sentenceBuilder?.bankWords ?? [];
  const isDenseSentenceLayout =
    isSentenceBuilder &&
    (sentenceTargetWords.length >= 5 ||
      sentenceBankWords.length >= 8 ||
      (sentenceBuilder?.sourceSentence.length ?? 0) >= 34);
  const isMultipleChoice = choices.length > 0;
  const promptText = isMultipleChoice ? "What do you hear?" : question.prompt;
  const hasInput = isSentenceBuilder
    ? slottedWords.every((word) => word.trim().length > 0)
    : userAnswer.trim().length > 0;

  const sentenceBankWordCounts = useMemo(
    () => countWords(sentenceBankWords),
    [sentenceBankWords]
  );
  const slottedWordCounts = useMemo(() => countWords(slottedWords), [slottedWords]);

  const placeWord = useCallback(
    (word: string) => {
      setSlottedWords((current) => {
        const next = [...current];

        const firstOpenIndex = next.findIndex((slotWord) => slotWord.length === 0);
        if (firstOpenIndex !== -1) {
          next[firstOpenIndex] = word;
          return next;
        }

        // Smart replacement: when full, replace the first incorrect slot.
        const mismatchIndex = next.findIndex(
          (slotWord, index) =>
            normalizeAnswer(slotWord) !==
            normalizeAnswer(sentenceTargetWords[index] ?? "")
        );

        if (mismatchIndex !== -1) {
          next[mismatchIndex] = word;
          return next;
        }

        next[next.length - 1] = word;
        return next;
      });

      setDragFromIndex(null);
    },
    [sentenceTargetWords]
  );

  const handleSlotPress = useCallback(
    (slotIndex: number) => {
      if (dragFromIndex != null) {
        if (dragFromIndex === slotIndex) {
          setDragFromIndex(null);
          return;
        }

        setSlottedWords((current) => {
          const next = [...current];
          [next[dragFromIndex], next[slotIndex]] = [
            next[slotIndex],
            next[dragFromIndex],
          ];
          return next;
        });
        setDragFromIndex(null);
        return;
      }

      if (slottedWords[slotIndex]?.length) {
        setSlottedWords((current) => {
          const next = [...current];
          next[slotIndex] = "";
          return next;
        });
      }
    },
    [dragFromIndex, slottedWords]
  );

  const handleSlotLongPress = useCallback(
    (slotIndex: number) => {
      if (!slottedWords[slotIndex]?.length) {
        return;
      }

      setDragFromIndex(slotIndex);
    },
    [slottedWords]
  );

  useEffect(() => {
    if (!isSentenceBuilder) {
      setSlottedWords([]);
      setDragFromIndex(null);
      return;
    }

    setSlottedWords(Array(sentenceTargetWords.length).fill(""));
    setDragFromIndex(null);
    onAnswerChange("");
  }, [isSentenceBuilder, onAnswerChange, question.answer, sentenceTargetWords.length]);

  useEffect(() => {
    if (!isSentenceBuilder) {
      return;
    }

    onAnswerChange(slottedWords.join(" ").trim());
  }, [isSentenceBuilder, onAnswerChange, slottedWords]);

  useEffect(() => {
    if (showSpeaker) {
      onPlayAudio();
    }
  }, [question.answer, showSpeaker, onPlayAudio]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#111111" />

      <View style={styles.quizFlowContent}>
        <View style={styles.quizTopRow}>
        <Pressable
          onPress={onBack}
          style={styles.quizBackIconButton}
          accessibilityRole="button"
          accessibilityLabel="Back to lessons"
        >
          <BackIcon width={22} height={22} />
        </Pressable>

        <View style={styles.quizHeaderProgressTrack}>
          <View
            style={[styles.quizHeaderProgressFill, { width: `${progress * 100}%` }]}
          />
        </View>
        </View>

        {showSpeaker && (
          <View
            style={[
              styles.speakerControlsRow,
              isDenseSentenceLayout && styles.speakerControlsRowCompact,
            ]}
          >
            <Pressable
              onPress={onPlayAudio}
              style={styles.speakerButton}
              accessibilityRole="button"
              accessibilityLabel="Play audio"
            >
              <SpeakerIcon width={34} height={34} />
            </Pressable>

            <Pressable
              onPress={onToggleAudioPlaybackRate}
              style={styles.speedToggleButton}
              accessibilityRole="button"
              accessibilityLabel="Toggle playback speed"
            >
              <Text style={styles.speedToggleText}>{audioPlaybackRate.toFixed(2)}x</Text>
            </Pressable>
          </View>
        )}

        <View
          style={[
            styles.quizPromptRow,
            isDenseSentenceLayout && styles.quizPromptRowCompact,
          ]}
        >
          <Text
            style={[
              styles.quizPromptWord,
              isDenseSentenceLayout && styles.quizPromptWordCompact,
            ]}
          >
            {promptText}
          </Text>
          <Pressable
            onPress={onOpenHint}
            style={styles.hintIconButton}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Open hint"
          >
            <HintIcon width={18} height={18} />
          </Pressable>
        </View>

        {isSentenceBuilder && sentenceBuilder ? (
          <View
            style={[
              styles.sentenceBuilderWrap,
              isDenseSentenceLayout && styles.sentenceBuilderWrapCompact,
            ]}
          >
            <View
              style={[
                styles.sentenceSourceCard,
                isDenseSentenceLayout && styles.sentenceSourceCardCompact,
              ]}
            >
              <Text
                style={[
                  styles.sentenceSourceText,
                  getDynamicSentencePromptStyle(
                    sentenceBuilder.sourceSentence,
                    isDenseSentenceLayout
                  ),
                ]}
                numberOfLines={2}
                adjustsFontSizeToFit
                minimumFontScale={0.72}
              >
                {sentenceBuilder.sourceSentence}
              </Text>
            </View>

            <View
              style={[styles.slotGrid, isDenseSentenceLayout && styles.slotGridCompact]}
            >
              {sentenceTargetWords.map((_, slotIndex) => {
                const slotWord = slottedWords[slotIndex] ?? "";
                const isActive = dragFromIndex === slotIndex;

                return (
                  <Pressable
                    key={`slot-${slotIndex}`}
                    onPress={() => handleSlotPress(slotIndex)}
                    onLongPress={() => handleSlotLongPress(slotIndex)}
                    delayLongPress={170}
                    hitSlop={10}
                    style={[
                      styles.slotChip,
                      isDenseSentenceLayout && styles.slotChipCompact,
                      slotWord.length > 0 && styles.slotChipFilled,
                      isActive && styles.slotChipActive,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`Sentence slot ${slotIndex + 1}`}
                  >
                    <Text
                      style={[
                        styles.slotChipText,
                        isDenseSentenceLayout && styles.slotChipTextCompact,
                        slotWord.length > 0 && styles.slotChipTextFilled,
                        getDynamicOptionTextStyle(
                          slotWord.length > 0
                            ? slotWord
                            : sentenceTargetWords[slotIndex] ?? "",
                          isDenseSentenceLayout
                        ),
                      ]}
                    >
                      {slotWord.length > 0 ? slotWord : "_"}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <View
              style={[
                styles.wordBankWrap,
                isDenseSentenceLayout && styles.wordBankWrapCompact,
              ]}
            >
              {sentenceBankWords.map((word, index) => {
                const maxWordCount = sentenceBankWordCounts[word] ?? 0;
                const usedWordCount = slottedWordCounts[word] ?? 0;
                const isDisabled = usedWordCount >= maxWordCount;

                return (
                  <Pressable
                    key={`bank-${word}-${index}`}
                    onPress={() => placeWord(word)}
                    disabled={isDisabled}
                    hitSlop={10}
                    style={[
                      styles.wordBankChip,
                      isDenseSentenceLayout && styles.wordBankChipCompact,
                      isDisabled && styles.wordBankChipDisabled,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`Use word ${word}`}
                  >
                    <Text
                      style={[
                        styles.wordBankChipText,
                        isDenseSentenceLayout && styles.wordBankChipTextCompact,
                        isDisabled && styles.wordBankChipTextDisabled,
                        getDynamicOptionTextStyle(word, isDenseSentenceLayout),
                      ]}
                    >
                      {word}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : isMultipleChoice ? (
          <View style={styles.multipleChoiceList}>
            {choices.map((choice) => {
              const isSelected = userAnswer === choice.label;

              return (
                <Pressable
                  key={`${choice.label}-${choice.translation}`}
                  onPress={() => onAnswerChange(choice.label)}
                  style={[
                    styles.choiceCard,
                    isSelected && styles.choiceCardSelected,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Choose ${choice.label}`}
                >
                  <Text
                    style={[
                      styles.choiceLabel,
                      isSelected && styles.choiceLabelSelected,
                    ]}
                  >
                    {choice.label}
                  </Text>
                  <Text
                    style={[
                      styles.choiceTranslation,
                      isSelected && styles.choiceTranslationSelected,
                    ]}
                  >
                    {choice.translation}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        {hasInput && feedback == null && <View style={styles.quizBottomSpacer} />}

        {hasInput && feedback == null && (
          <Pressable
            style={[
              styles.checkButton,
              isDenseSentenceLayout && styles.checkButtonCompact,
            ]}
            accessibilityRole="button"
            onPress={onCheckAnswer}
          >
            <Text
              style={[
                styles.checkButtonText,
                isDenseSentenceLayout && styles.checkButtonTextCompact,
              ]}
            >
              Check
            </Text>
          </Pressable>
        )}
      </View>

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

          {feedback === "wrong" && (
            <Text style={styles.feedbackAnswerText}>
              The correct answer is "{question.answer}".
            </Text>
          )}

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

      <Modal
        visible={isHintModalOpen}
        transparent
        animationType="fade"
        onRequestClose={onCloseHint}
      >
        <View style={styles.hintModalBackdrop}>
          <View style={styles.hintModalCard}>
            <Text style={styles.hintModalTitle}>Words and Meanings</Text>

            <ScrollView
              style={styles.hintModalList}
              showsVerticalScrollIndicator={false}
            >
              {hintEntries.map((entry) => (
                <View key={entry.word} style={styles.hintModalRow}>
                  <Text style={styles.hintWord}>{entry.word}</Text>
                  <Text style={styles.hintMeaning}>{entry.meaning}</Text>
                </View>
              ))}
            </ScrollView>

            <Pressable onPress={onCloseHint} style={styles.hintModalCloseButton}>
              <Text style={styles.hintModalCloseText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
      <View style={styles.completedContent}>
                <Text style={styles.completedSubtitle}>Lesson: {lessonTitle}</Text>
        <Text style={styles.completedTitle}>You completed this lesson</Text>

        <View style={styles.completedIllustrationWrap}>
          <CompletionIllustration width="100%" height="100%" />
        </View>

        <Pressable style={styles.restartButton} onPress={onRestart}>
          <Text style={styles.restartButtonText}>Restart</Text>
        </Pressable>

        <Pressable style={styles.continueButton} onPress={onContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function LessonCard({
  lesson,
  lessonNumber,
  isLocked,
  onStart,
}: {
  lesson: Lesson;
  lessonNumber: number;
  isLocked: boolean;
  onStart: () => void;
}) {
  const progress =
    lesson.totalQuestions === 0
      ? 0
      : lesson.answeredQuestions / lesson.totalQuestions;

  return (
    <Pressable
      style={[styles.lessonCard, isLocked && styles.lessonCardLocked]}
      onPress={onStart}
      disabled={isLocked}
      accessibilityRole="button"
      accessibilityLabel={
        isLocked
          ? `Lesson ${lessonNumber}: ${lesson.title} is locked until audio is available`
          : `Start lesson ${lessonNumber}: ${lesson.title}`
      }
    >
      <Text style={styles.lessonCardTitle}>{lessonNumber}. {lesson.title}</Text>
      {isLocked && <Text style={styles.lessonCardMeta}>Audio coming soon</Text>}
      <View style={styles.lessonCardProgressTrack}>
        {progress > 0 && (
          <View
            style={[styles.lessonCardProgressFill, { width: `${progress * 100}%` }]}
          />
        )}
      </View>
    </Pressable>
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

function buildMixedQuestionSet(
  wordQuestions: Question[],
  sentenceSeeds: SentenceBuilderSeed[]
): Question[] {
  const sentenceQuestionCount = Math.min(
    sentenceSeeds.length,
    Math.floor(wordQuestions.length / 2)
  );
  const sentenceQuestionIndices = new Set(
    pickRandomIndices(wordQuestions.length, sentenceQuestionCount)
  );
  let sentenceSeedIndex = 0;

  return wordQuestions.map((question, index) => {
    if (!sentenceQuestionIndices.has(index)) {
      return question;
    }

    const matchedSeed = findSentenceSeedForQuestion(question, sentenceSeeds);
    const sentenceSeed = matchedSeed ?? sentenceSeeds[sentenceSeedIndex] ?? null;
    sentenceSeedIndex += matchedSeed ? 0 : 1;

    if (!sentenceSeed) {
      return question;
    }

    const sentenceAnswer = sentenceSeed.targetWords.join(" ");

    return {
      prompt: "Translate this sentence",
      answer: sentenceAnswer,
      visualKey: "",
      audioKey: question.audioKey,
      sentenceBuilder: {
        sourceSentence: sentenceSeed.sourceSentence,
        targetWords: sentenceSeed.targetWords,
        bankWords: shuffleArray([
          ...sentenceSeed.targetWords,
          ...sentenceSeed.distractors,
        ]),
      },
    };
  });
}

function findSentenceSeedForQuestion(
  question: Question,
  sentenceSeeds: SentenceBuilderSeed[]
): SentenceBuilderSeed | null {
  const normalizedQuestionAnswer = normalizeAnswer(question.answer);

  return (
    sentenceSeeds.find(
      (seed) =>
        normalizeAnswer(seed.targetWords.join(" ")) === normalizedQuestionAnswer
    ) ?? null
  );
}

function buildGreetingSentenceSeeds(): SentenceBuilderSeed[] {
  const allGreetingWords = GREETINGS_PHRASES.flatMap((phrase) =>
    tokenizeSentenceWords(phrase)
  );

  return GREETINGS_PHRASES.map((phrase) => {
    const targetWords = tokenizeSentenceWords(phrase);
    const distractorPool = allGreetingWords.filter(
      (word) => !targetWords.includes(word)
    );

    return {
      sourceSentence: GREETINGS_TRANSLATIONS[phrase] ?? "Translate this greeting",
      targetWords,
      distractors: shuffleArray(distractorPool).slice(0, 3),
    };
  });
}

function buildSentenceSeedsFromEntries(
  entries: Array<{ english: string; igbo: string }>
): SentenceBuilderSeed[] {
  const allWords = entries.flatMap((entry) => tokenizeSentenceWords(entry.igbo));

  return entries.map((entry) => {
    const targetWords = tokenizeSentenceWords(entry.igbo);
    const distractors = shuffleArray(
      allWords.filter((word) => !targetWords.includes(word))
    ).slice(0, 3);

    return {
      sourceSentence: entry.english,
      targetWords,
      distractors,
    };
  });
}

function tokenizeSentenceWords(value: string): string[] {
  return value
    .replace(/[?.,!'";:]/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function pickRandomIndices(totalCount: number, pickCount: number): number[] {
  const allIndices = Array.from({ length: totalCount }, (_, index) => index);
  return shuffleArray(allIndices).slice(0, Math.max(0, pickCount));
}

function getDynamicOptionTextStyle(
  word: string,
  compact: boolean = false
): {
  fontSize: number;
  lineHeight: number;
} {
  const length = word.trim().length;

  if (compact) {
    if (length >= 12) {
      return { fontSize: 11, lineHeight: 14 };
    }

    if (length >= 9) {
      return { fontSize: 12, lineHeight: 15 };
    }

    if (length >= 6) {
      return { fontSize: 13, lineHeight: 16 };
    }

    return { fontSize: 14, lineHeight: 17 };
  }

  if (length >= 12) {
    return { fontSize: 14, lineHeight: 18 };
  }

  if (length >= 9) {
    return { fontSize: 15, lineHeight: 19 };
  }

  if (length >= 6) {
    return { fontSize: 17, lineHeight: 21 };
  }

  return { fontSize: 19, lineHeight: 23 };
}

function getDynamicSentencePromptStyle(
  sentence: string,
  compact: boolean = false
): {
  fontSize: number;
  lineHeight: number;
} {
  const length = sentence.trim().length;

  if (compact) {
    if (length >= 38) {
      return { fontSize: 13, lineHeight: 16 };
    }

    if (length >= 28) {
      return { fontSize: 14, lineHeight: 18 };
    }

    return { fontSize: 15, lineHeight: 19 };
  }

  if (length >= 38) {
    return { fontSize: 16, lineHeight: 20 };
  }

  if (length >= 28) {
    return { fontSize: 18, lineHeight: 22 };
  }

  return { fontSize: 20, lineHeight: 24 };
}

function countWords(words: string[]): Record<string, number> {
  return words.reduce<Record<string, number>>((acc, word) => {
    if (!word) {
      return acc;
    }

    acc[word] = (acc[word] ?? 0) + 1;
    return acc;
  }, {});
}

function buildLessonChoices(lessonId: string, question: Question): ChoiceOption[] {
  const lessonQuestions = (ACTIVE_QUESTION_BANK[lessonId] ?? []).filter(
    (item) => !item.sentenceBuilder
  );
  const uniquePool = lessonQuestions.filter(
    (item, index, array) =>
      array.findIndex(
        (candidate) =>
          normalizeAnswer(candidate.answer) === normalizeAnswer(item.answer)
      ) === index
  );

  const distractors = shuffleArray(
    uniquePool.filter(
      (item) => normalizeAnswer(item.answer) !== normalizeAnswer(question.answer)
    )
  ).slice(0, 3);

  const selected = shuffleArray([question, ...distractors]);

  return selected.map((item) => ({
    label: item.answer,
    translation: getChoiceTranslation(lessonId, item),
  }));
}

function getChoiceTranslation(lessonId: string, question: Question): string {
  if (lessonId === "greetings") {
    return GREETINGS_TRANSLATIONS[question.answer] ?? "Translation pending";
  }

  return question.prompt;
}

function shuffleArray<T>(values: T[]): T[] {
  const copy = [...values];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

function normalizeAnswer(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[?.,!'";:]/g, "")
    .replace(/…/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function toPercent(value: number): number {
  return Math.round(value * 100);
}

function isPersistedProgress(value: unknown): value is PersistedProgress {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<PersistedProgress>;
  return (
    typeof candidate.answeredByLesson === "object" &&
    candidate.answeredByLesson != null &&
    typeof candidate.completedOnByLesson === "object" &&
    candidate.completedOnByLesson != null
  );
}

function getTodayKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
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
    justifyContent: "flex-start",
    paddingHorizontal: 28,
    paddingTop: 56,
    paddingBottom: 0,
  },
  homeTopContent: {
    width: "100%",
    alignItems: "center",
    marginTop: 44,
    marginBottom: 36,
    gap: 72,
  },
  homeHeadline: {
    color: "#F7F7F7",
    textAlign: "center",
    fontFamily: "DMSans_400Regular",
    fontSize: 36,
    lineHeight: 40,
  },
  homeHeroWrap: {
    width: "105%",
    aspectRatio: 0.72,
    maxWidth: 820,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -20,
    marginBottom: -20,
  },
  button: {
    width: "100%",
    maxWidth: 620,
    minHeight: 100,
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
    fontFamily: "DMSans_700Bold",
    fontSize: 28,
    lineHeight: 36,
  },
  lessonsContent: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 28,
  },
  lessonsHeaderRow: {
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    backgroundColor: "#0D0F14",
    paddingTop: 8,
    paddingBottom: 10,
    paddingHorizontal: 4,
    zIndex: 2,
    marginBottom: 18,
  },
  metricWrap: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  metricText: {
    color: "#FFFFFF",
    fontFamily: "DMSans_700Bold",
    fontSize: 22,
    lineHeight: 24,
  },
  lessonsHeaderCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  lessonsHeaderLogo: {
    width: 92,
    height: 54,
  },
  lessonList: {
    gap: 22,
    paddingTop: 6,
  },
  lessonCard: {
    minHeight: 106,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#2A2F3A",
    backgroundColor: "#1A1C21",
    paddingHorizontal: 32,
    paddingTop: 30,
    paddingBottom: 22,
    justifyContent: "center",
    overflow: "hidden",
  },
  lessonCardLocked: {
    opacity: 0.72,
  },
  lessonCardTitle: {
    color: "#F4F4F4",
    fontFamily: "DMSans_700Bold",
    fontSize: 21,
    lineHeight: 24,
  },
  lessonCardMeta: {
    marginTop: 6,
    color: "#99A6B4",
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    lineHeight: 18,
  },
  lessonCardProgressTrack: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 6,
    backgroundColor: "transparent",
    overflow: "hidden",
  },
  lessonCardProgressFill: {
    height: "100%",
    backgroundColor: "#4FC3FF",
  },
  quizFlowContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  quizTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  quizBackIconButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#3A3B3F",
    alignItems: "center",
    justifyContent: "center",
  },
  quizHeaderProgressTrack: {
    flex: 1,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#45484D",
    overflow: "hidden",
  },
  quizHeaderProgressFill: {
    height: "100%",
    borderRadius: 9,
    backgroundColor: "#9CD754",
  },
  speakerButton: {
    marginTop: 0,
    width: 66,
    height: 66,
    borderRadius: 33,
    alignSelf: "center",
    backgroundColor: "#3A3B3F",
    alignItems: "center",
    justifyContent: "center",
  },
  speakerControlsRow: {
    marginTop: 22,
    flexDirection: "row",
    alignSelf: "center",
    alignItems: "center",
    gap: 10,
  },
  speakerControlsRowCompact: {
    marginTop: 10,
  },
  speedToggleButton: {
    minHeight: 36,
    minWidth: 66,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#2B313D",
    backgroundColor: "#181C23",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  speedToggleText: {
    color: "#DDE7F1",
    fontFamily: "DMSans_700Bold",
    fontSize: 12,
    lineHeight: 14,
  },
  quizPromptRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  quizPromptRowCompact: {
    marginTop: 8,
  },
  quizPromptWord: {
    color: "#FFFFFF",
    fontFamily: "DMSans_400Regular",
    fontSize: 24,
    lineHeight: 28,
  },
  quizPromptWordCompact: {
    fontSize: 20,
    lineHeight: 24,
  },
  hintIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3A3B3F",
  },
  quizVisualWrap: {
    marginTop: 24,
    height: 190,
    width: "100%",
  },
  quizVisualFallback: {
    color: "#8AA0B8",
    textAlign: "center",
    fontSize: 22,
    lineHeight: 28,
    marginTop: 100,
  },
  sentenceBuilderWrap: {
    marginTop: 14,
    gap: 10,
  },
  sentenceBuilderWrapCompact: {
    marginTop: 8,
    gap: 6,
  },
  sentenceSourceCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2B313D",
    backgroundColor: "#181C23",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  sentenceSourceCardCompact: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  sentenceSourceText: {
    color: "#F4F7FA",
    textAlign: "center",
    fontFamily: "DMSans_700Bold",
    fontSize: 24,
    lineHeight: 28,
  },
  slotGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
  },
  slotGridCompact: {
    gap: 7,
  },
  slotChip: {
    minWidth: 98,
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2A2F3A",
    borderStyle: "dashed",
    backgroundColor: "#10141B",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  slotChipCompact: {
    minWidth: 86,
    minHeight: 44,
    borderRadius: 13,
    paddingHorizontal: 8,
  },
  slotChipFilled: {
    borderStyle: "solid",
    borderColor: "#4EC5FF",
    backgroundColor: "#172634",
  },
  slotChipActive: {
    borderColor: "#F7C654",
    backgroundColor: "#2E2412",
  },
  slotChipText: {
    color: "#5E6F83",
    fontFamily: "DMSans_700Bold",
    fontSize: 20,
    lineHeight: 24,
  },
  slotChipTextCompact: {
    fontSize: 16,
    lineHeight: 20,
  },
  slotChipTextFilled: {
    color: "#F2FAFF",
  },
  sentenceBuilderHelperText: {
    color: "#7E91A6",
    textAlign: "center",
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    lineHeight: 16,
    marginTop: -2,
  },
  sentenceHelperText: {
    color: "#97A9BC",
    textAlign: "center",
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    lineHeight: 18,
  },
  wordBankWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },
  wordBankWrapCompact: {
    gap: 7,
  },
  wordBankChip: {
    minHeight: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#2B313D",
    backgroundColor: "#181C23",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  wordBankChipCompact: {
    minHeight: 42,
    borderRadius: 21,
    paddingHorizontal: 10,
  },
  wordBankChipDisabled: {
    opacity: 0.35,
  },
  wordBankChipText: {
    color: "#F3F7FB",
    fontFamily: "DMSans_700Bold",
    fontSize: 16,
    lineHeight: 20,
  },
  wordBankChipTextCompact: {
    fontSize: 13,
    lineHeight: 17,
  },
  wordBankChipTextDisabled: {
    color: "#8A97A6",
  },
  answerInputWrap: {
    marginTop: 24,
    gap: 18,
  },
  multipleChoiceList: {
    marginTop: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  choiceCard: {
    width: "48%",
    minHeight: 112,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#2B313D",
    backgroundColor: "#181C23",
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: "center",
  },
  choiceCardSelected: {
    borderColor: "#4EC5FF",
    backgroundColor: "#1C2E3B",
  },
  choiceLabel: {
    color: "#F3F7FB",
    fontFamily: "DMSans_700Bold",
    fontSize: 30,
    lineHeight: 34,
    textAlign: "center",
  },
  choiceLabelSelected: {
    color: "#DDF5FF",
  },
  choiceTranslation: {
    marginTop: 2,
    color: "#97A7B8",
    fontFamily: "DMSans_400Regular",
    fontSize: 18,
    lineHeight: 22,
    textAlign: "center",
  },
  choiceTranslationSelected: {
    color: "#AEDDFF",
  },
  answerInput: {
    color: "#E7F7FF",
    fontSize: 28,
    lineHeight: 34,
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
  quizBottomSpacer: {
    flex: 1,
    minHeight: 10,
  },
  checkButton: {
    marginTop: 0,
    marginBottom: 4,
    minHeight: 68,
    borderRadius: 20,
    backgroundColor: "#3CC1FF",
    alignItems: "center",
    justifyContent: "center",
  },
  checkButtonCompact: {
    minHeight: 56,
    borderRadius: 16,
  },
  checkButtonText: {
    color: "#0C1721",
    fontSize: 31,
    lineHeight: 35,
    fontWeight: "800",
  },
  checkButtonTextCompact: {
    fontSize: 24,
    lineHeight: 28,
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
    justifyContent: "center",
    gap: 12,
    marginBottom: 14,
  },
  feedbackIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
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
    fontSize: 26,
    lineHeight: 30,
    fontWeight: "700",
  },
  feedbackTitle: {
    fontSize: 34,
    lineHeight: 38,
    fontWeight: "700",
  },
  feedbackTitleCorrect: {
    color: "#33980C",
  },
  feedbackTitleWrong: {
    color: "#EA2E35",
  },
  feedbackAnswerText: {
    textAlign: "center",
    color: "#7A2124",
    fontFamily: "DMSans_400Regular",
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 12,
  },
  feedbackAction: {
    minHeight: 72,
    borderRadius: 22,
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
    fontSize: 38,
    lineHeight: 42,
    fontWeight: "700",
  },
  hintModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  hintModalCard: {
    width: "100%",
    maxHeight: "80%",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#2A2F3A",
    backgroundColor: "#15181E",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  hintModalTitle: {
    color: "#F5F7FA",
    textAlign: "center",
    fontFamily: "DMSans_700Bold",
    fontSize: 24,
    lineHeight: 28,
    marginBottom: 14,
  },
  hintModalList: {
    maxHeight: 420,
  },
  hintModalRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#252A33",
    gap: 4,
  },
  hintWord: {
    color: "#FFFFFF",
    fontFamily: "DMSans_700Bold",
    fontSize: 18,
    lineHeight: 22,
  },
  hintMeaning: {
    color: "#99A6B4",
    fontFamily: "DMSans_400Regular",
    fontSize: 16,
    lineHeight: 22,
  },
  hintModalCloseButton: {
    marginTop: 18,
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: "#4FC3FF",
    alignItems: "center",
    justifyContent: "center",
  },
  hintModalCloseText: {
    color: "#07141E",
    fontFamily: "DMSans_700Bold",
    fontSize: 20,
    lineHeight: 24,
  },
  completedContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    justifyContent: "center",
    paddingTop: 16,
    paddingBottom: 20,
  },
  completedTitle: {
    color: "#F7F7F7",
    textAlign: "center",
    fontSize: 42,
    lineHeight: 46,
    fontWeight: "800",
    letterSpacing: -0.6,
    maxWidth: 420,
  },
  completedSubtitle: {
    marginTop: 8,
    color: "#7BCDF8",
    textAlign: "center",
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "600",
  },
  completedIllustrationWrap: {
    width: "100%",
    maxWidth: 330,
    height: 180,
    marginTop: 12,
    marginBottom: 18,
  },
  restartButton: {
    width: "100%",
    maxWidth: 320,
    minHeight: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#3A97C5",
    backgroundColor: "rgba(72, 192, 247, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 48,
    marginBottom: 48,
  },
  restartButtonText: {
    color: "#7BBEDC",
    fontSize: 22,
    lineHeight: 26,
    fontWeight: "600",
  },
  continueButton: {
    width: "100%",
    maxWidth: 320,
    minHeight: 62,
    borderRadius: 18,
    backgroundColor: "#48B8EE",
    alignItems: "center",
    justifyContent: "center",
  },
  continueButtonText: {
    color: "#0F1A22",
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "700",
  },
});
