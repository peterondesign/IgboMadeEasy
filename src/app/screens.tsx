import { useCallback, useEffect, useMemo, useState } from "react";
import { StatusBar } from "react-native";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import BackIcon from "../../assets/icons/back-icon.svg";
import HintIcon from "../../assets/icons/hint-icon.svg";
import LoginIcon from "../../assets/icons/login-icon.svg";
import LockIcon from "../../assets/icons/lock-icon.svg";
import SpeakerIcon from "../../assets/icons/speaker-icon.svg";
import CompletionIllustration from "../../assets/illustrations/lesson-complete.svg";
import FireIllustration from "../../assets/illustrations/fire.svg";
import PlantIllustration from "../../assets/illustrations/plant.svg";
import { QUESTION_VISUALS } from "./questionVisuals";
import StoryMode, { type StoryModeQuestion } from "./storyMode";
import { styles } from "./styles";

type Question = {
  prompt: string;
  answer: string;
  visualKey: string;
  audioKey?: string;
  storyMode?: StoryModeQuestion;
  sentenceBuilder?: {
    sourceSentence: string;
    targetWords: string[];
    bankWords: string[];
  };
};

type Lesson = {
  id: string;
  title: string;
  totalQuestions: number;
  answeredQuestions: number;
  completedOn: string | null;
};

type FeedbackState = "correct" | "wrong" | null;

type ChoiceOption = {
  label: string;
  translation: string;
};

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

function countWords(words: string[]): Record<string, number> {
  return words.reduce<Record<string, number>>((acc, word) => {
    if (!word) {
      return acc;
    }

    acc[word] = (acc[word] ?? 0) + 1;
    return acc;
  }, {});
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

function toPercent(value: number): number {
  return Math.round(value * 100);
}

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfWeek(date: Date): Date {
  const start = new Date(date);
  const day = start.getDay();
  const delta = (day + 6) % 7;
  start.setDate(start.getDate() - delta);
  start.setHours(0, 0, 0, 0);
  return start;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function LessonsScreen({
  lessons,
  overallProgress,
  streakCount,
  hasPremiumAccess,
  isAuthBusy,
  onLoginPress,
  isUpgradeModalOpen,
  signupEmail,
  onSignupEmailChange,
  onCloseUpgradeModal,
  onUpgradeSubmit,
  onLogoutPress,
  onRestorePurchasesPress,
  onOpenStreakScreen,
  onStartLesson,
}: {
  lessons: Lesson[];
  overallProgress: number;
  streakCount: number;
  isLoggedIn: boolean;
  hasPremiumAccess: boolean;
  isAuthBusy: boolean;
  onLoginPress: () => void;
  isUpgradeModalOpen: boolean;
  signupEmail: string;
  onSignupEmailChange: (value: string) => void;
  onCloseUpgradeModal: () => void;
  onUpgradeSubmit: () => void;
  onLogoutPress: () => void;
  onRestorePurchasesPress: () => void;
  onOpenStreakScreen: () => void;
  onStartLesson: (lessonId: string) => void;
}) {
  const canAccessPremiumLessons = hasPremiumAccess;
  const [isAccountPopoverOpen, setIsAccountPopoverOpen] = useState(false);
  const avatarInitial = signupEmail.trim().charAt(0).toUpperCase() || "P";

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
          <View style={styles.lessonsHeaderCenter}>
            <Image
              source={require("../../assets/illustrations/logo-with-text.png")}
              style={styles.lessonsHeaderLogo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.metricsRow}>
            <Pressable
              style={styles.metricWrap}
              onPress={onOpenStreakScreen}
              accessibilityRole="button"
              accessibilityLabel="Open streak screen"
            >
              <FireIllustration width={20} height={20} />
              <Text style={styles.metricText}>{streakCount}</Text>
            </Pressable>

            <View style={styles.metricWrap}>
              <PlantIllustration width={20} height={20} />
              <Text style={styles.metricText}>{toPercent(overallProgress)}%</Text>
            </View>
          </View>
        </View>

        <View style={styles.lessonList}>
          {lessons.map((lesson, index) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              lessonNumber={index + 1}
              lockReason={
                lesson.totalQuestions === 0
                  ? "audio"
                  : index >= 5 && !canAccessPremiumLessons
                    ? "premium"
                    : null
              }
              onStart={() => onStartLesson(lesson.id)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.fixedFooter}>
        {!hasPremiumAccess ? (
          <Pressable
            style={styles.loginFooterButton}
            onPress={onLoginPress}
            disabled={isAuthBusy}
            accessibilityRole="button"
            accessibilityLabel="Upgrade to Premium"
          >
            <LoginIcon width={18} height={18} />
            <Text style={styles.loginFooterButtonText}>
              {isAuthBusy ? "Working..." : "Upgrade to Premium"}
            </Text>
          </Pressable>
        ) : (
          <View style={styles.premiumFooterRow}>
            <View style={styles.premiumBadgeChip}>
              <Text style={styles.premiumBadgeText}>Premium</Text>
            </View>

            <Pressable
              style={styles.avatarButton}
              onPress={() => setIsAccountPopoverOpen((value) => !value)}
              accessibilityRole="button"
              accessibilityLabel="Open account menu"
            >
              <Text style={styles.avatarText}>{avatarInitial}</Text>
            </Pressable>
          </View>
        )}

        {hasPremiumAccess && isAccountPopoverOpen ? (
          <View style={styles.accountPopover}>
            <Text style={styles.accountPopoverEmail}>
              {signupEmail || "Premium member"}
            </Text>
            <Pressable
              style={styles.accountPopoverSecondaryButton}
              onPress={() => {
                setIsAccountPopoverOpen(false);
                onRestorePurchasesPress();
              }}
            >
              <Text style={styles.accountPopoverSecondaryText}>
                Restore Purchases
              </Text>
            </Pressable>
            <Pressable
              style={styles.accountPopoverLogout}
              onPress={() => {
                setIsAccountPopoverOpen(false);
                onLogoutPress();
              }}
            >
              <Text style={styles.accountPopoverLogoutText}>Log out</Text>
            </Pressable>
          </View>
        ) : null}
      </View>

      <Modal
        visible={isUpgradeModalOpen}
        transparent
        animationType="fade"
        onRequestClose={onCloseUpgradeModal}
      >
        <View style={styles.hintModalBackdrop}>
          <View style={styles.upgradeModalCard}>
            <Text style={styles.upgradeModalTitle}>Upgrade to Premium</Text>
            <Text style={styles.upgradeModalText}>
              Enter your email, then continue straight to Apple Pay.
            </Text>

            <TextInput
              style={styles.upgradeEmailInput}
              placeholder="you@example.com"
              placeholderTextColor="#7F8B99"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={signupEmail}
              onChangeText={onSignupEmailChange}
            />

            <Pressable
              style={styles.upgradeSubmitButton}
              onPress={onUpgradeSubmit}
              disabled={isAuthBusy}
            >
              <Text style={styles.upgradeSubmitText}>
                {isAuthBusy ? "Working..." : "Continue to Apple Pay"}
              </Text>
            </Pressable>

            <Pressable
              style={styles.upgradeCancelButton}
              onPress={onCloseUpgradeModal}
              disabled={isAuthBusy}
            >
              <Text style={styles.upgradeCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {isAuthBusy ? (
        <View style={styles.loadingOverlay} pointerEvents="auto">
          <View style={styles.loadingCard}>
            <ActivityIndicator size="small" color="#4FC3FF" />
            <Text style={styles.loadingText}>Processing your purchase...</Text>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

export function StreakScreen({
  lessons,
  streakCount,
  onBack,
}: {
  lessons: Lesson[];
  streakCount: number;
  onBack: () => void;
}) {
  const [weekOffset, setWeekOffset] = useState(0);
  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => toDateKey(today), [today]);
  const completedDayKeys = useMemo(
    () =>
      new Set(
        lessons
          .map((lesson) => lesson.completedOn)
          .filter((value): value is string => Boolean(value))
      ),
    [lessons]
  );
  const activeWeekStart = useMemo(
    () => addDays(startOfWeek(today), weekOffset * 7),
    [today, weekOffset]
  );
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(activeWeekStart, index)),
    [activeWeekStart]
  );
  const weekLabel = useMemo(() => {
    const formatter = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    });
    return `${formatter.format(weekDays[0])} - ${formatter.format(weekDays[6])}`;
  }, [weekDays]);
  const canGoPreviousWeek = weekOffset > -1;
  const canGoNextWeek = weekOffset < 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#111111" />
      <View style={styles.streakScreenContainer}>
        <View style={styles.streakScreenTopRow}>
          <Pressable
            style={styles.quizBackIconButton}
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <BackIcon width={18} height={18} />
          </Pressable>

          <Text style={styles.streakScreenTitle}>Streak</Text>

          <View style={styles.streakScreenCounter}>
            <FireIllustration width={18} height={18} />
            <Text style={styles.streakScreenCounterText}>{streakCount}</Text>
          </View>
        </View>

        <View style={styles.streakScreenCard}>
          <View style={styles.streakScreenHeaderRow}>
            <Text style={styles.streakScreenCardTitle}>Streak Calendar</Text>
            <Text style={styles.streakScreenWeekTag}>
              {weekOffset === 0 ? "Current week" : "Last week"}
            </Text>
          </View>

          <View style={styles.streakWeekNavRow}>
            <Pressable
              style={[
                styles.streakWeekNavButton,
                !canGoPreviousWeek ? styles.streakWeekNavButtonDisabled : null,
              ]}
              onPress={() =>
                setWeekOffset((value) => (value > -1 ? value - 1 : value))
              }
              disabled={!canGoPreviousWeek}
            >
              <Text style={styles.streakWeekNavText}>- 1 week</Text>
            </Pressable>

            <Text style={styles.streakWeekLabel}>{weekLabel}</Text>

            <Pressable
              style={[
                styles.streakWeekNavButton,
                !canGoNextWeek ? styles.streakWeekNavButtonDisabled : null,
              ]}
              onPress={() =>
                setWeekOffset((value) => (value < 0 ? value + 1 : value))
              }
              disabled={!canGoNextWeek}
            >
              <Text style={styles.streakWeekNavText}>+ 1 week</Text>
            </Pressable>
          </View>

          <View style={styles.streakDaysRow}>
            {weekDays.map((day) => {
              const dayKey = toDateKey(day);
              const isToday = dayKey === todayKey;
              const isCompleted = completedDayKeys.has(dayKey);

              return (
                <View key={dayKey} style={styles.streakDayItem}>
                  <Text style={styles.streakDayLabel}>
                    {day.toLocaleDateString("en-US", { weekday: "short" })}
                  </Text>
                  <View
                    style={[
                      styles.streakDayCircle,
                      isCompleted ? styles.streakDayCircleCompleted : null,
                      isToday ? styles.streakDayCircleToday : null,
                    ]}
                  />
                  <Text style={styles.streakDateLabel}>{day.getDate()}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

export function QuizScreen({
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
  isAudioLoading,
  isAudioPlaying,
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
  audioPlaybackRate: 0.5 | 1;
  onToggleAudioPlaybackRate: () => void;
  isAudioLoading: boolean;
  isAudioPlaying: boolean;
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
  const storyMode = question.storyMode;
  const isStoryMode = storyMode != null;
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
  const isSpeakerDisabled = isAudioLoading || isAudioPlaying;
  const QuestionIllustration =
    question.visualKey.length > 0 ? QUESTION_VISUALS[question.visualKey] : null;
  const promptText = isMultipleChoice ? "What do you hear?" : question.prompt;
  const hasInput = isSentenceBuilder
    ? slottedWords.every((word) => word.trim().length > 0)
    : userAnswer.trim().length > 0;
  const isAutoContinuingStory = isStoryMode && feedback === "correct";

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
  }, [question.audioKey, question.answer, question.storyMode?.igboText, showSpeaker, onPlayAudio]);

  useEffect(() => {
    if (!isAutoContinuingStory) {
      return;
    }

    const timeoutId = setTimeout(() => {
      onContinue();
    }, 900);

    return () => clearTimeout(timeoutId);
  }, [isAutoContinuingStory, onContinue, question.answer]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#111111" />

      <View style={styles.quizFlowContent}>
        <View style={styles.quizTopRow}>
          <Pressable
            onPress={onBack}
            style={styles.quizBackIconButton}
            hitSlop={12}
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
              style={[
                styles.speakerButton,
                isSpeakerDisabled && styles.speakerButtonDisabled,
              ]}
              disabled={isSpeakerDisabled}
              hitSlop={14}
              accessibilityRole="button"
              accessibilityLabel={
                isAudioLoading
                  ? "Audio loading"
                  : isAudioPlaying
                    ? "Audio playing"
                    : "Play audio"
              }
            >
              {isAudioLoading ? (
                <View style={styles.speakerSkeletonGlyph} />
              ) : (
                <SpeakerIcon width={34} height={34} />
              )}
            </Pressable>

            <Pressable
              onPress={onToggleAudioPlaybackRate}
              style={[
                styles.speedToggleButton,
                isSpeakerDisabled && styles.speedToggleButtonDisabled,
              ]}
              disabled={isSpeakerDisabled}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Toggle playback speed"
            >
              <Text style={styles.speedToggleText}>
                {audioPlaybackRate === 1 ? "1x" : "0.5x"}
              </Text>
            </Pressable>
          </View>
        )}

        {isStoryMode && storyMode ? (
          <StoryMode
            story={storyMode}
            selectedAnswer={userAnswer}
            onSelectAnswer={onAnswerChange}
          />
        ) : (
          <>
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
                hitSlop={14}
                accessibilityRole="button"
                accessibilityLabel="Open hint"
              >
                <HintIcon width={18} height={18} />
              </Pressable>
            </View>

            {QuestionIllustration ? (
              <View style={styles.quizIllustrationSlot}>
                <QuestionIllustration width={120} height={120} />
              </View>
            ) : null}

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
                    hitSlop={14}
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
                    hitSlop={14}
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
                      style={[styles.choiceCard, isSelected && styles.choiceCardSelected]}
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
          </>
        )}

        {hasInput && feedback == null && <View style={styles.quizBottomSpacer} />}

        {hasInput && feedback == null && (
          <View style={styles.checkButtonFixedWrap}>
            <Pressable
              style={[
                styles.checkButton,
                isDenseSentenceLayout && styles.checkButtonCompact,
              ]}
              hitSlop={12}
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
          </View>
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
              isAutoContinuingStory && styles.feedbackActionDisabled,
            ]}
            onPress={onContinue}
            disabled={isAutoContinuingStory}
            accessibilityRole="button"
          >
            <Text style={styles.feedbackActionText}>
              {feedback === "correct"
                ? isAutoContinuingStory
                  ? "Next..."
                  : "Continue"
                : "Continue"}
            </Text>
          </Pressable>
        </View>
      )}

      {!isStoryMode ? (
        <Modal
          visible={isHintModalOpen}
          transparent
          animationType="fade"
          onRequestClose={onCloseHint}
        >
          <View style={styles.hintModalBackdrop}>
            <View style={styles.hintModalCard}>
              <Text style={styles.hintModalTitle}>Hint</Text>

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
      ) : null}
    </SafeAreaView>
  );
}

export function CompletedLessonScreen({
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
  lockReason,
  onStart,
}: {
  lesson: Lesson;
  lessonNumber: number;
  lockReason: "audio" | "premium" | null;
  onStart: () => void;
}) {
  const isLocked = lockReason != null;
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
        lockReason === "audio"
          ? `Lesson ${lessonNumber}: ${lesson.title} is locked until audio is available`
          : lockReason === "premium"
            ? `Lesson ${lessonNumber}: ${lesson.title} is locked for premium users`
            : `Start lesson ${lessonNumber}: ${lesson.title}`
      }
    >
      <View style={styles.lessonCardTitleRow}>
        <Text style={styles.lessonCardTitle}>
          {lessonNumber}. {lesson.title}
        </Text>
        {isLocked ? (
          <View style={styles.lessonCardLockPill}>
            <LockIcon width={14} height={14} />
            <Text style={styles.lessonCardLockPillText}>Locked</Text>
          </View>
        ) : null}
      </View>
      {lockReason === "audio" && (
        <Text style={styles.lessonCardMeta}>Audio coming soon</Text>
      )}
      {lockReason === "premium" && (
        <Text style={styles.lessonCardMeta}>Upgrade to Premium</Text>
      )}
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