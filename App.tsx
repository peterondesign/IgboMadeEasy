import AsyncStorage from "@react-native-async-storage/async-storage";
import * as AppleAuthentication from "expo-apple-authentication";
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
import { Alert } from "react-native";
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
  ASKING_QUESTIONS_AUDIO,
  ASKING_QUESTIONS_ENTRIES,
} from "./src/data/askingQuestionsAudio";
import { ASKING_QUESTIONS_STORY_AUDIO } from "./src/data/askingQuestionsStoryAudio";
import { ANIMALS_AUDIO, ANIMALS_ENTRIES } from "./src/data/animalsAudio";
import {
  CELEBRATIONS_AUDIO,
  CELEBRATIONS_ENTRIES,
} from "./src/data/celebrationsAudio";
import { CELEBRATIONS_STORY_AUDIO } from "./src/data/celebrationsStoryAudio";
import { COLORS_AUDIO, COLORS_ENTRIES } from "./src/data/colorsAudio";
import { ELDERS_AUDIO, ELDERS_ENTRIES } from "./src/data/eldersAudio";
import { ELDERS_STORY_AUDIO } from "./src/data/eldersStoryAudio";
import { EMOTIONS_AUDIO, EMOTIONS_ENTRIES } from "./src/data/emotionsAudio";
import { EMOTIONS_STORY_AUDIO } from "./src/data/emotionsStoryAudio";
import {
  EVERYDAY_VERBS_AUDIO,
  EVERYDAY_VERBS_ENTRIES,
} from "./src/data/everydayVerbsAudio";
import { EVERYDAY_VERBS_STORY_AUDIO } from "./src/data/everydayVerbsStoryAudio";
import {
  FAMILY_PEOPLE_AUDIO,
  FAMILY_PEOPLE_ENTRIES,
} from "./src/data/familyPeopleAudio";
import { FAMILY_PEOPLE_STORY_AUDIO } from "./src/data/familyPeopleStoryAudio";
import {
  FOOD_COOKING_AUDIO,
  FOOD_COOKING_ENTRIES,
} from "./src/data/foodCookingAudio";
import { FOOD_COOKING_STORY_AUDIO } from "./src/data/foodCookingStoryAudio";
import {
  GIRL_AND_SKULL_AUDIO,
  GIRL_AND_SKULL_ENTRIES,
} from "./src/data/girlAndSkullAudio";
import { GIRL_AND_SKULL_STORY_AUDIO } from "./src/data/girlAndSkullStoryAudio";
import { GREETINGS_AUDIO, GREETINGS_PHRASES } from "./src/data/greetingsAudio";
import { HEALTH_AUDIO, HEALTH_ENTRIES } from "./src/data/healthAudio";
import { HEALTH_STORY_AUDIO } from "./src/data/healthStoryAudio";
import {
  HOUSEHOLD_OBJECTS_AUDIO,
  HOUSEHOLD_OBJECTS_ENTRIES,
} from "./src/data/householdObjectsAudio";
import { HOUSEHOLD_OBJECTS_STORY_AUDIO } from "./src/data/householdObjectsStoryAudio";
import {
  MOSQUITO_AND_EAR_AUDIO,
  MOSQUITO_AND_EAR_ENTRIES,
} from "./src/data/mosquitoAndEarAudio";
import { MOSQUITO_AND_EAR_STORY_AUDIO } from "./src/data/mosquitoAndEarStoryAudio";
import {
  POINTING_THINGS_OUT_AUDIO,
  POINTING_THINGS_OUT_ENTRIES,
} from "./src/data/pointingThingsOutAudio";
import { POINTING_THINGS_OUT_STORY_AUDIO } from "./src/data/pointingThingsOutStoryAudio";
import {
  NUMBERS_MONEY_AUDIO,
  NUMBERS_MONEY_ENTRIES,
} from "./src/data/numbersMoneyAudio";
import { NUMBERS_MONEY_STORY_AUDIO } from "./src/data/numbersMoneyStoryAudio";
import {
  SCHOOL_WORK_AUDIO,
  SCHOOL_WORK_ENTRIES,
} from "./src/data/schoolWorkAudio";
import { SCHOOL_WORK_STORY_AUDIO } from "./src/data/schoolWorkStoryAudio";
import {
  TRANSPORTATION_AUDIO,
  TRANSPORTATION_ENTRIES,
} from "./src/data/transportationAudio";
import { TRANSPORTATION_STORY_AUDIO } from "./src/data/transportationStoryAudio";
import {
  TORTOISE_AND_ITS_SHELL_AUDIO,
  TORTOISE_AND_ITS_SHELL_ENTRIES,
} from "./src/data/tortoiseAndItsShellAudio";
import { TORTOISE_AND_ITS_SHELL_STORY_AUDIO } from "./src/data/tortoiseAndItsShellStoryAudio";
import {
  TORTOISE_AND_DOVE_AUDIO,
  TORTOISE_AND_DOVE_ENTRIES,
} from "./src/data/tortoiseAndDoveAudio";
import { TORTOISE_AND_DOVE_STORY_AUDIO } from "./src/data/tortoiseAndDoveStoryAudio";
import {
  WEATHER_NATURE_AUDIO,
  WEATHER_NATURE_ENTRIES,
} from "./src/data/weatherNatureAudio";
import { WEATHER_NATURE_STORY_AUDIO } from "./src/data/weatherNatureStoryAudio";
import { GREETINGS_STORY_AUDIO } from "./src/data/greetingsStoryAudio";
import { VISUAL_KEY_OVERRIDES_BY_IGBO } from "./src/data/illustrationOverrides";
import {
  SENTENCE_BREAKDOWNS_AUDIO,
  SENTENCE_BREAKDOWNS_EXAMPLE_IGBO_AUDIO,
  SENTENCE_BREAKDOWNS_IGBO_AUDIO,
} from "./src/data/sentenceBreakdownsAudio";
import GameGroup from "./src/groups/GameGroup";
import HomeGroup from "./src/groups/HomeGroup";
import LessonGroup from "./src/groups/LessonGroup";
import {
  CompletedLessonScreen,
  LessonsScreen,
  PremiumScreen,
  SentenceBreakdownLessonScreen,
  QuizScreen,
  StreakScreen,
} from "./src/app/screens";
import { styles } from "./src/app/styles";
import {
  getLastPremiumAccessReason,
  logoutPremiumAccess,
  PREMIUM_ANNUAL_PRODUCT_ID,
  PREMIUM_MONTHLY_PRODUCT_ID,
  purchasePremiumAccess,
  restorePremiumPurchases,
  restorePremiumStatus,
} from "./src/services/premiumPurchase";
import {
  scheduleDemoLessonReminderNotifications,
  syncDailyLessonReminderNotifications,
} from "./src/services/lessonReminders";

type ScreenName =
  | "home"
  | "lessons"
  | "quiz"
  | "completed"
  | "streak"
  | "premium";
type AppGroup = "home" | "lesson" | "game";
type FeedbackState = "correct" | "wrong" | null;

type StorySpeaker = "dad" | "daughter" | "granddaughter" | "dove";

type StoryModeQuestion = {
  speaker: StorySpeaker;
  igboText: string;
  englishText: string;
  statement: string;
  correctAnswer: boolean;
  dadSvgPath: string;
  daughterSvgPath: string;
};

type StoryDialogueEntry = StoryModeQuestion & {
  audioKey?: string;
  voice: "male" | "female" | "very-young-girl";
  falseStatement?: string;
};

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
  sentenceBreakdown?: {
    sourceSentence: string;
    targetWords: string[];
    bankWords: string[];
    wordGlosses?: string[];
    igboRule: string;
    anotherExample: {
      igbo: string;
      english: string;
    };
    anotherExampleAudioKey?: string;
    illustrationKey: string;
  };
};

type SentenceBuilderSeed = {
  sourceSentence: string;
  targetWords: string[];
  distractors: string[];
};

type SentenceBreakdownSeed = {
  sourceSentence: string;
  targetWords: string[];
  distractors: string[];
  igboRule: string;
  anotherExample: {
    igbo: string;
    english: string;
  };
  illustrationKey: string;
  audioKey?: string;
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
  completedDayKeys?: string[];
};

type RemovableSubscription = {
  remove: () => void;
};

const STORAGE_KEY = "igbo-made-easy.lesson-progress.v1";
const PREMIUM_UNLOCK_STORAGE_KEY = "igbo-made-easy.premium-unlock.v1";
const GREETINGS_STORY_DIALOGUE = require("./assets/audio/greetings/story-dialogue.json") as StoryDialogueEntry[];
const EVERYDAY_VERBS_STORY_DIALOGUE = require("./assets/audio/everyday-verbs/story-dialogue.json") as StoryDialogueEntry[];
const ASKING_QUESTIONS_STORY_DIALOGUE = require("./assets/audio/asking-questions/story-dialogue.json") as StoryDialogueEntry[];
const CELEBRATIONS_STORY_DIALOGUE = require("./assets/audio/celebrations/story-dialogue.json") as StoryDialogueEntry[];
const ELDERS_STORY_DIALOGUE = require("./assets/audio/elders/story-dialogue.json") as StoryDialogueEntry[];
const EMOTIONS_STORY_DIALOGUE = require("./assets/audio/emotions/story-dialogue.json") as StoryDialogueEntry[];
const FOOD_COOKING_STORY_DIALOGUE = require("./assets/audio/food-cooking/story-dialogue.json") as StoryDialogueEntry[];
const FAMILY_PEOPLE_STORY_DIALOGUE = require("./assets/audio/family-people/story-dialogue.json") as StoryDialogueEntry[];
const GIRL_AND_SKULL_STORY_DIALOGUE = require("./assets/audio/girl-and-skull/story-dialogue.json") as StoryDialogueEntry[];
const HEALTH_STORY_DIALOGUE = require("./assets/audio/health/story-dialogue.json") as StoryDialogueEntry[];
const HOUSEHOLD_OBJECTS_STORY_DIALOGUE = require("./assets/audio/household-objects/story-dialogue.json") as StoryDialogueEntry[];
const MOSQUITO_AND_EAR_STORY_DIALOGUE = require("./assets/audio/mosquito-and-ear/story-dialogue.json") as StoryDialogueEntry[];
const POINTING_THINGS_OUT_STORY_DIALOGUE = require("./assets/audio/pointing-things-out/story-dialogue.json") as StoryDialogueEntry[];
const NUMBERS_MONEY_STORY_DIALOGUE = require("./assets/audio/numbers-money/story-dialogue.json") as StoryDialogueEntry[];
const SCHOOL_WORK_STORY_DIALOGUE = require("./assets/audio/school-work/story-dialogue.json") as StoryDialogueEntry[];
const TORTOISE_AND_ITS_SHELL_STORY_DIALOGUE = require("./assets/audio/tortoise-and-its-shell/story-dialogue.json") as StoryDialogueEntry[];
const TORTOISE_AND_DOVE_STORY_DIALOGUE = require("./assets/audio/tortoise-and-dove/story-dialogue.json") as StoryDialogueEntry[];
const TRANSPORTATION_STORY_DIALOGUE = require("./assets/audio/transportation/story-dialogue.json") as StoryDialogueEntry[];
const WEATHER_NATURE_STORY_DIALOGUE = require("./assets/audio/weather-nature/story-dialogue.json") as StoryDialogueEntry[];

const GREETINGS_TRANSLATIONS = require("./assets/audio/greetings/translations.json") as Record<
  string,
  string
>;
const EVERYDAY_VERBS_TRANSLATIONS = require("./assets/audio/everyday-verbs/translations.json") as Record<
  string,
  string
>;
const ASKING_QUESTIONS_TRANSLATIONS = require("./assets/audio/asking-questions/translations.json") as Record<
  string,
  string
>;
const FAMILY_PEOPLE_TRANSLATIONS = require("./assets/audio/family-people/translations.json") as Record<
  string,
  string
>;
const FOOD_COOKING_TRANSLATIONS = require("./assets/audio/food-cooking/translations.json") as Record<
  string,
  string
>;
const GIRL_AND_SKULL_TRANSLATIONS = require("./assets/audio/girl-and-skull/translations.json") as Record<
  string,
  string
>;
const NUMBERS_MONEY_TRANSLATIONS = require("./assets/audio/numbers-money/translations.json") as Record<
  string,
  string
>;
const SCHOOL_WORK_TRANSLATIONS = require("./assets/audio/school-work/translations.json") as Record<
  string,
  string
>;
const TORTOISE_AND_ITS_SHELL_TRANSLATIONS = require("./assets/audio/tortoise-and-its-shell/translations.json") as Record<
  string,
  string
>;
const TORTOISE_AND_DOVE_TRANSLATIONS = require("./assets/audio/tortoise-and-dove/translations.json") as Record<
  string,
  string
>;
const TRANSPORTATION_TRANSLATIONS = require("./assets/audio/transportation/translations.json") as Record<
  string,
  string
>;
const EMOTIONS_TRANSLATIONS = require("./assets/audio/emotions/translations.json") as Record<
  string,
  string
>;
const HEALTH_TRANSLATIONS = require("./assets/audio/health/translations.json") as Record<
  string,
  string
>;
const HOUSEHOLD_OBJECTS_TRANSLATIONS = require("./assets/audio/household-objects/translations.json") as Record<
  string,
  string
>;
const MOSQUITO_AND_EAR_TRANSLATIONS = require("./assets/audio/mosquito-and-ear/translations.json") as Record<
  string,
  string
>;
const POINTING_THINGS_OUT_TRANSLATIONS = require("./assets/audio/pointing-things-out/translations.json") as Record<
  string,
  string
>;
const WEATHER_NATURE_TRANSLATIONS = require("./assets/audio/weather-nature/translations.json") as Record<
  string,
  string
>;
const ANIMALS_TRANSLATIONS = require("./assets/audio/animals/translations.json") as Record<
  string,
  string
>;
const ELDERS_TRANSLATIONS = require("./assets/audio/elders/translations.json") as Record<
  string,
  string
>;
const CELEBRATIONS_TRANSLATIONS = require("./assets/audio/celebrations/translations.json") as Record<
  string,
  string
>;
const COLORS_TRANSLATIONS = require("./assets/audio/colors/translations.json") as Record<
  string,
  string
>;

const LESSON_TRANSLATIONS: Record<string, Record<string, string>> = {
  greetings: GREETINGS_TRANSLATIONS,
  "everyday-verbs": EVERYDAY_VERBS_TRANSLATIONS,
  "asking-questions": ASKING_QUESTIONS_TRANSLATIONS,
  "family-people": FAMILY_PEOPLE_TRANSLATIONS,
  "food-cooking": FOOD_COOKING_TRANSLATIONS,
  "girl-and-skull": GIRL_AND_SKULL_TRANSLATIONS,
  "numbers-money": NUMBERS_MONEY_TRANSLATIONS,
  "school-work": SCHOOL_WORK_TRANSLATIONS,
  "tortoise-and-its-shell": TORTOISE_AND_ITS_SHELL_TRANSLATIONS,
  "tortoise-and-dove": TORTOISE_AND_DOVE_TRANSLATIONS,
  transportation: TRANSPORTATION_TRANSLATIONS,
  emotions: EMOTIONS_TRANSLATIONS,
  health: HEALTH_TRANSLATIONS,
  "household-objects": HOUSEHOLD_OBJECTS_TRANSLATIONS,
  "mosquito-and-ear": MOSQUITO_AND_EAR_TRANSLATIONS,
  "pointing-things-out": POINTING_THINGS_OUT_TRANSLATIONS,
  "weather-nature": WEATHER_NATURE_TRANSLATIONS,
  animals: ANIMALS_TRANSLATIONS,
  elders: ELDERS_TRANSLATIONS,
  celebrations: CELEBRATIONS_TRANSLATIONS,
  colors: COLORS_TRANSLATIONS,
};

const DEFAULT_VISUAL_KEY_BY_ENGLISH_PROMPT: Record<string, string> = {
  Dog: "nouns-dog",
  Water: "nouns-water",
  Child: "nouns-child",
  Sun: "nouns-sun",
  House: "nouns-house",
  Road: "nouns-road",
  Food: "nouns-food",
  Book: "nouns-book",
  Friend: "nouns-friend",
  Money: "nouns-money",
  "to eat": "verbs-eat",
  "to go": "verbs-go",
  "to come": "verbs-come",
  "to see": "verbs-see",
  "to speak": "verbs-speak",
  "to sleep": "verbs-sleep",
  "to read": "verbs-read",
  "to write": "verbs-write",
  "to work": "verbs-work",
  "to play": "verbs-play",
};

const NORMALIZED_VISUAL_KEY_OVERRIDES_BY_IGBO: Record<string, string> =
  Object.entries(VISUAL_KEY_OVERRIDES_BY_IGBO).reduce<Record<string, string>>(
    (acc, [igbo, visualKey]) => {
      acc[normalizeAnswer(igbo)] = visualKey;
      return acc;
    },
    {}
  );

const GAME_SOUND_SUCCESS = require("./assets/audio/game-sounds/success-sound.mp3");
const GAME_SOUND_FAILURE = require("./assets/audio/game-sounds/try-again-sound.mp3");
const QUESTION_AUDIO: Record<string, number> = {
  ...ASKING_QUESTIONS_AUDIO,
  ...ASKING_QUESTIONS_STORY_AUDIO,
  ...ANIMALS_AUDIO,
  ...CELEBRATIONS_AUDIO,
  ...CELEBRATIONS_STORY_AUDIO,
  ...COLORS_AUDIO,
  ...ELDERS_AUDIO,
  ...ELDERS_STORY_AUDIO,
  ...EMOTIONS_AUDIO,
  ...EMOTIONS_STORY_AUDIO,
  ...GIRL_AND_SKULL_AUDIO,
  ...GIRL_AND_SKULL_STORY_AUDIO,
  ...GREETINGS_AUDIO,
  ...HEALTH_AUDIO,
  ...HEALTH_STORY_AUDIO,
  ...HOUSEHOLD_OBJECTS_AUDIO,
  ...HOUSEHOLD_OBJECTS_STORY_AUDIO,
  ...MOSQUITO_AND_EAR_AUDIO,
  ...MOSQUITO_AND_EAR_STORY_AUDIO,
  ...POINTING_THINGS_OUT_AUDIO,
  ...POINTING_THINGS_OUT_STORY_AUDIO,
  ...NUMBERS_MONEY_AUDIO,
  ...NUMBERS_MONEY_STORY_AUDIO,
  ...SCHOOL_WORK_AUDIO,
  ...SCHOOL_WORK_STORY_AUDIO,
  ...TORTOISE_AND_ITS_SHELL_AUDIO,
  ...TORTOISE_AND_ITS_SHELL_STORY_AUDIO,
  ...TORTOISE_AND_DOVE_AUDIO,
  ...TORTOISE_AND_DOVE_STORY_AUDIO,
  ...TRANSPORTATION_AUDIO,
  ...TRANSPORTATION_STORY_AUDIO,
  ...WEATHER_NATURE_AUDIO,
  ...WEATHER_NATURE_STORY_AUDIO,
  ...EVERYDAY_VERBS_AUDIO,
  ...EVERYDAY_VERBS_STORY_AUDIO,
  ...FAMILY_PEOPLE_AUDIO,
  ...FAMILY_PEOPLE_STORY_AUDIO,
  ...FOOD_COOKING_AUDIO,
  ...FOOD_COOKING_STORY_AUDIO,
  ...GREETINGS_STORY_AUDIO,
};

const WORD_QUESTION_BANK: Record<string, Question[]> = {
  greetings: GREETINGS_PHRASES.map((phrase) => {
    const answer = toToneMarkedText("greetings", phrase);

    return {
      prompt: "What do you hear?",
      answer,
      visualKey: resolveVisualKey("What do you hear?", answer),
      audioKey: resolveAudioKey(GREETINGS_AUDIO, answer),
    };
  }),
  "everyday-verbs": EVERYDAY_VERBS_ENTRIES.map((entry) => {
    const answer = toToneMarkedText("everyday-verbs", entry.igbo);

    return {
      prompt: entry.english,
      answer,
      visualKey: resolveVisualKey(entry.english, answer),
      audioKey: resolveAudioKey(EVERYDAY_VERBS_AUDIO, answer),
    };
  }),
  "asking-questions": ASKING_QUESTIONS_ENTRIES.map((entry) => {
    const answer = toToneMarkedText("asking-questions", entry.igbo);

    return {
      prompt: entry.english,
      answer,
      visualKey: resolveVisualKey(entry.english, answer),
      audioKey: resolveAudioKey(ASKING_QUESTIONS_AUDIO, answer),
    };
  }),
  "family-people": FAMILY_PEOPLE_ENTRIES.map((entry) => {
    const answer = toToneMarkedText("family-people", entry.igbo);

    return {
      prompt: entry.english,
      answer,
      visualKey: resolveVisualKey(entry.english, answer),
      audioKey: resolveAudioKey(FAMILY_PEOPLE_AUDIO, answer),
    };
  }),
  "food-cooking": FOOD_COOKING_ENTRIES.map((entry) => {
    const answer = toToneMarkedText("food-cooking", entry.igbo);

    return {
      prompt: entry.english,
      answer,
      visualKey: resolveVisualKey(entry.english, answer),
      audioKey: resolveAudioKey(FOOD_COOKING_AUDIO, answer),
    };
  }),
  "girl-and-skull": GIRL_AND_SKULL_ENTRIES.map((entry) => {
    const answer = toToneMarkedText("girl-and-skull", entry.igbo);

    return {
      prompt: entry.english,
      answer,
      visualKey: resolveVisualKey(entry.english, answer),
      audioKey: resolveAudioKey(GIRL_AND_SKULL_AUDIO, answer),
    };
  }),
  "numbers-money": NUMBERS_MONEY_ENTRIES.map((entry) => {
    const answer = toToneMarkedText("numbers-money", entry.igbo);

    return {
      prompt: entry.english,
      answer,
      visualKey: resolveVisualKey(entry.english, answer),
      audioKey: resolveAudioKey(NUMBERS_MONEY_AUDIO, answer),
    };
  }),
  "school-work": SCHOOL_WORK_ENTRIES.map((entry) => {
    const answer = toToneMarkedText("school-work", entry.igbo);

    return {
      prompt: entry.english,
      answer,
      visualKey: resolveVisualKey(entry.english, answer),
      audioKey: resolveAudioKey(SCHOOL_WORK_AUDIO, answer),
    };
  }),
  "tortoise-and-its-shell": TORTOISE_AND_ITS_SHELL_ENTRIES.map((entry) => {
    const answer = toToneMarkedText("tortoise-and-its-shell", entry.igbo);

    return {
      prompt: entry.english,
      answer,
      visualKey: resolveVisualKey(entry.english, answer),
      audioKey: resolveAudioKey(TORTOISE_AND_ITS_SHELL_AUDIO, answer),
    };
  }),
  "tortoise-and-dove": TORTOISE_AND_DOVE_ENTRIES.map((entry) => {
    const answer = toToneMarkedText("tortoise-and-dove", entry.igbo);

    return {
      prompt: entry.english,
      answer,
      visualKey: resolveVisualKey(entry.english, answer),
      audioKey: resolveAudioKey(TORTOISE_AND_DOVE_AUDIO, answer),
    };
  }),
  transportation: TRANSPORTATION_ENTRIES.map((entry) => {
    const answer = toToneMarkedText("transportation", entry.igbo);

    return {
      prompt: entry.english,
      answer,
      visualKey: resolveVisualKey(entry.english, answer),
      audioKey: resolveAudioKey(TRANSPORTATION_AUDIO, answer),
    };
  }),
  emotions: EMOTIONS_ENTRIES.map((entry) => {
    const answer = toToneMarkedText("emotions", entry.igbo);

    return {
      prompt: entry.english,
      answer,
      visualKey: resolveVisualKey(entry.english, answer),
      audioKey: resolveAudioKey(EMOTIONS_AUDIO, answer),
    };
  }),
  health: HEALTH_ENTRIES.map((entry) => {
    const answer = toToneMarkedText("health", entry.igbo);

    return {
      prompt: entry.english,
      answer,
      visualKey: resolveVisualKey(entry.english, answer),
      audioKey: resolveAudioKey(HEALTH_AUDIO, answer),
    };
  }),
  "household-objects": HOUSEHOLD_OBJECTS_ENTRIES.map((entry) => {
    const answer = toToneMarkedText("household-objects", entry.igbo);

    return {
      prompt: entry.english,
      answer,
      visualKey: resolveVisualKey(entry.english, answer),
      audioKey: resolveAudioKey(HOUSEHOLD_OBJECTS_AUDIO, answer),
    };
  }),
  "mosquito-and-ear": MOSQUITO_AND_EAR_ENTRIES.map((entry) => {
    const answer = toToneMarkedText("mosquito-and-ear", entry.igbo);

    return {
      prompt: entry.english,
      answer,
      visualKey: resolveVisualKey(entry.english, answer),
      audioKey: resolveAudioKey(MOSQUITO_AND_EAR_AUDIO, answer),
    };
  }),
  "pointing-things-out": POINTING_THINGS_OUT_ENTRIES.map((entry) => {
    const answer = toToneMarkedText("pointing-things-out", entry.igbo);

    return {
      prompt: entry.english,
      answer,
      visualKey: resolveVisualKey(entry.english, answer),
      audioKey: resolveAudioKey(POINTING_THINGS_OUT_AUDIO, answer),
    };
  }),
  "weather-nature": WEATHER_NATURE_ENTRIES.map((entry) => {
    const answer = toToneMarkedText("weather-nature", entry.igbo);

    return {
      prompt: entry.english,
      answer,
      visualKey: resolveVisualKey(entry.english, answer),
      audioKey: resolveAudioKey(WEATHER_NATURE_AUDIO, answer),
    };
  }),
  animals: ANIMALS_ENTRIES.map((entry) => {
    const answer = toToneMarkedText("animals", entry.igbo);

    return {
      prompt: entry.english,
      answer,
      visualKey: resolveVisualKey(entry.english, answer),
      audioKey: resolveAudioKey(ANIMALS_AUDIO, answer),
    };
  }),
  elders: ELDERS_ENTRIES.map((entry) => {
    const answer = toToneMarkedText("elders", entry.igbo);

    return {
      prompt: entry.english,
      answer,
      visualKey: resolveVisualKey(entry.english, answer),
      audioKey: resolveAudioKey(ELDERS_AUDIO, answer),
    };
  }),
  celebrations: CELEBRATIONS_ENTRIES.map((entry) => {
    const answer = toToneMarkedText("celebrations", entry.igbo);

    return {
      prompt: entry.english,
      answer,
      visualKey: resolveVisualKey(entry.english, answer),
      audioKey: resolveAudioKey(CELEBRATIONS_AUDIO, answer),
    };
  }),
  colors: COLORS_ENTRIES.map((entry) => {
    const answer = toToneMarkedText("colors", entry.igbo);

    return {
      prompt: entry.english,
      answer,
      visualKey: resolveVisualKey(entry.english, answer),
      audioKey: resolveAudioKey(COLORS_AUDIO, answer),
    };
  }),
};

const SENTENCE_BUILDER_BANK: Record<string, SentenceBuilderSeed[]> = {
  greetings: buildGreetingSentenceSeeds(),
  "everyday-verbs": buildSentenceSeedsFromEntries(EVERYDAY_VERBS_ENTRIES),
  "asking-questions": buildSentenceSeedsFromEntries(ASKING_QUESTIONS_ENTRIES),
  "family-people": buildSentenceSeedsFromEntries(FAMILY_PEOPLE_ENTRIES),
  "food-cooking": buildSentenceSeedsFromEntries(FOOD_COOKING_ENTRIES),
  "girl-and-skull": buildSentenceSeedsFromEntries(GIRL_AND_SKULL_ENTRIES),
  "numbers-money": buildSentenceSeedsFromEntries(NUMBERS_MONEY_ENTRIES),
  "school-work": buildSentenceSeedsFromEntries(SCHOOL_WORK_ENTRIES),
  "tortoise-and-its-shell": buildSentenceSeedsFromEntries(
    TORTOISE_AND_ITS_SHELL_ENTRIES
  ),
  "tortoise-and-dove": buildSentenceSeedsFromEntries(TORTOISE_AND_DOVE_ENTRIES),
  transportation: buildSentenceSeedsFromEntries(TRANSPORTATION_ENTRIES),
  emotions: buildSentenceSeedsFromEntries(EMOTIONS_ENTRIES),
  health: buildSentenceSeedsFromEntries(HEALTH_ENTRIES),
  "household-objects": buildSentenceSeedsFromEntries(HOUSEHOLD_OBJECTS_ENTRIES),
  "mosquito-and-ear": buildSentenceSeedsFromEntries(MOSQUITO_AND_EAR_ENTRIES),
  "pointing-things-out": buildSentenceSeedsFromEntries(POINTING_THINGS_OUT_ENTRIES),
  "weather-nature": buildSentenceSeedsFromEntries(WEATHER_NATURE_ENTRIES),
  animals: buildSentenceSeedsFromEntries(ANIMALS_ENTRIES),
  elders: buildSentenceSeedsFromEntries(ELDERS_ENTRIES),
  celebrations: buildSentenceSeedsFromEntries(CELEBRATIONS_ENTRIES),
  colors: buildSentenceSeedsFromEntries(COLORS_ENTRIES),
};

const SENTENCE_BREAKDOWN_WORD_GLOSSES: Record<string, string[]> = {
  "what-is-your-name": ["what", "is", "name", "your"],
  "how-are-you": ["how", "is", "you", "doing"],
  "i-want-to-go-home": ["want", "I", "to-go", "home"],
  "i-do-not-understand": ["do-not-know", "I"],
  "i-am-hungry": ["hunger", "is", "on", "me"],
  "i-have-two-brothers": ["sibling", "my", "plural", "male", "two"],
  "i-will-come-tomorrow": ["will", "I", "come", "tomorrow"],
  "where-is-our-sister": ["where", "is", "sister", "our", "located"],
  "they-are-tired": ["they", "became", "tired"],
  "we-are-thirsty": ["we", "are", "thirsting", "water"],
  "give-him-water": ["give", "him", "water"],
  "he-is-going-to-the-river-to-fetch-water": [
    "he",
    "is",
    "going",
    "to",
    "river",
    "to",
    "fetch",
    "water",
  ],
  "i-am-going-to-see-my-father-at-the-farm": [
    "will",
    "I",
    "see",
    "father",
    "my",
    "farm",
  ],
  "if-it-rains-we-will-stay-at-home": [
    "if",
    "it-happens",
    "that",
    "rain",
    "we",
    "will",
    "stay",
    "home",
  ],
  "my-house-is-bigger-than-your-house": [
    "house",
    "my",
    "is",
    "big",
    "than",
    "house",
    "your",
  ],
  "shall-we-go-see-them": ["let", "us", "go", "see", "them"],
  "the-boy-who-is-playing-football-is-my-friend": [
    "child",
    "male",
    "who-is",
    "playing",
    "football",
    "is",
    "friend",
    "my",
  ],
  "they-are-playing-football-near-the-school": [
    "they",
    "are",
    "playing",
    "football",
    "near",
    "house",
    "school",
  ],
  "they-walked-a-long-distance-this-morning": [
    "they",
    "walked",
    "distance",
    "long",
    "morning",
    "today",
  ],
  "we-can-go-tomorrow": ["we", "have", "power/can", "go", "tomorrow"],
  "we-cannot-go-home": ["we", "will-not", "go", "home"],

  // Past, Present & Future Tenses
  "i-am-eating-food": ["present", "I", "eat", "food"],
  "i-am-going-home": ["present", "I", "go", "home"],
  "i-am-learning-igbo": ["present", "I", "learn", "Igbo"],
  "i-ate-food": ["ate-past", "I", "food"],
  "i-went-home": ["went-past", "I", "home"],
  "i-learned-igbo": ["learned-past", "I", "Igbo"],
  "i-will-eat-food": ["will", "I", "eat", "food"],
  "i-will-go-home": ["will", "I", "go", "home"],
  "i-will-learn-igbo": ["will", "I", "learn", "Igbo"],

  // Describing Things (Adjectives)
  "big-house": ["house", "big"],
  "good-person": ["person", "good"],
  "small-child": ["child", "small"],
  "beautiful-woman": ["woman", "beautiful", "beautiful"],
  "the-house-is-big": ["house", "that", "is", "big"],
  "the-food-is-good": ["food", "that", "is", "good"],
  "the-water-is-cold": ["water", "that", "is", "cold"],
  "the-food-is-very-good": ["food", "that", "is", "very", "good"],
  "the-child-is-strong": ["child", "that", "is", "strong"],

  // Time & Dates
  "learning-igbo-today": ["present", "I", "learn", "Igbo", "today"],
  "went-to-market-yesterday": ["went", "I", "market", "yesterday"],
  "will-go-tomorrow": ["will", "I", "come", "tomorrow"],
  "will-come-at-3": ["will", "I", "come", "at", "clock", "three"],
  "work-in-morning": ["present", "I", "do", "work", "in-morning"],
  "meet-in-evening": ["we", "will-meet", "in", "evening"],
  "learning-igbo-this-week": ["present", "I", "learn", "Igbo", "week", "this"],
  "went-market-last-week": ["went", "I", "market", "week", "went", "past"],
  "start-new-job-next-week": ["will", "I", "start", "job", "new", "week", "coming"],

  // Travel & Culture
  "i-am-travelling": ["present", "I", "go", "journey"],
  "where-is-the-market": ["where", "is", "market", "located"],
  "i-am-going-to-town": ["present", "I", "go", "town"],
  "we-will-meet-at-village-square": ["we", "will-meet", "at-square"],
  "my-father-is-at-family-compound": ["father", "my", "is", "at-family-compound"],
  "i-will-visit-my-sibling": ["will", "I", "visit", "sibling", "my"],
  "the-celebration-was-beautiful": ["celebration", "that", "beautiful", "beautiful"],
  "i-will-visit-my-family": ["will", "I", "visit", "family", "my"],
  "i-am-going-to-my-fathers-hometown": ["present", "I", "go", "town", "father", "my"],

  // Opinions & Debate lesson (position 14)
  "i-think-it-is-good": ["think", "I", "that", "it", "is", "good"],
  "in-my-opinion-igbo-easy": ["opinion", "my", "Igbo", "is", "easy"],
  "i-agree-with-you": ["agree", "I", "you"],
  "i-disagree": ["agree", "not-I"],
  "what-do-you-think": ["what", "that", "you", "think"],
  "i-think-because-useful": ["think", "I", "that", "it", "is", "good", "because", "that", "it", "has", "value"],
  "that-is-true": ["one", "that", "is", "truth"],
  "that-is-false": ["one", "that", "is", "lie"],
  "i-think-we-should-go": ["think", "I", "that", "we", "should", "go"],

  // Shopping & Bargaining lesson (position 15)
  "how-much-is-it": ["money", "how-much", "that", "it", "is"],
  "i-want-to-shop": ["want", "I", "to-buy", "goods"],
  "i-am-buying-a-book": ["present", "I", "buying", "book"],
  "it-is-expensive": ["it", "is", "excessive", "price"],
  "please-reduce-the-price": ["please", "reduce", "price", "goods"],
  "i-want-three-mangoes": ["want", "I", "mango", "three"],
  "i-have-money": ["have", "I", "money"],
  "give-me-two-bananas": ["give", "me", "banana", "two"],
  "i-bought-shoes": ["bought", "I", "skin", "feet"],

  // Igbo Idioms and Proverbs lesson (position 16)
  "proverbs-oil-words": ["proverb", "is", "oil", "used", "eat", "words"],
  "proverbs-kite-eagle": ["kite", "perch,", "eagle", "perch"],
  "proverbs-wash-hands": ["child", "wash-past", "hands,", "he", "join", "plural", "elders", "eat", "food"],
  "proverbs-hands-cooperate": ["hand", "right", "wash-subjunctive", "hand", "left,", "hand", "left", "wash-subjunctive", "hand", "right"],
  "proverbs-askquestions": ["person", "question", "does-not", "lose", "way"],
  "proverbs-one-tree": ["one", "tree", "does-not", "make", "forest"],
  "proverbs-serve-king": ["person", "serve", "king,", "king", "reach", "him"],
  "proverbs-hero-known": ["they", "present-identify", "general", "in-battle"],
  "proverbs-actions-good": ["they", "use", "know", "person", "good", "is", "conduct", "his"],
};

const QUESTION_BANK: Record<string, Question[]> = {
  "introduction-to-igbo": buildSentenceBreakdownQuestionSet(
    buildIntroductionToIgboBreakdownSeeds()
  ),
  "getting-started": buildSentenceBreakdownQuestionSet(
    buildGettingStartedBreakdownSeeds()
  ),
  "tenses": buildSentenceBreakdownQuestionSet(
    buildTensesBreakdownSeeds()
  ),
  "adjectives": buildSentenceBreakdownQuestionSet(
    buildAdjectivesBreakdownSeeds()
  ),
  "time-dates": buildSentenceBreakdownQuestionSet(
    buildTimeDatesBreakdownSeeds()
  ),
  "travel-culture": buildSentenceBreakdownQuestionSet(
    buildTravelCultureBreakdownSeeds()
  ),
  "opinions-debate": buildSentenceBreakdownQuestionSet(
    buildOpinionsDebateBreakdownSeeds()
  ),
  "shopping-bargaining": buildSentenceBreakdownQuestionSet(
    buildShoppingBargainingBreakdownSeeds()
  ),
  "proverbs-idioms": buildSentenceBreakdownQuestionSet(
    buildProverbsIdiomsBreakdownSeeds()
  ),
  greetings: buildLessonQuestionSet(
    "greetings",
    "Greetings",
    WORD_QUESTION_BANK.greetings,
    SENTENCE_BUILDER_BANK.greetings
  ),
  "everyday-verbs": buildLessonQuestionSet(
    "everyday-verbs",
    "Everyday Verbs",
    WORD_QUESTION_BANK["everyday-verbs"],
    SENTENCE_BUILDER_BANK["everyday-verbs"]
  ),
  "asking-questions": buildLessonQuestionSet(
    "asking-questions",
    "Asking Questions",
    WORD_QUESTION_BANK["asking-questions"],
    SENTENCE_BUILDER_BANK["asking-questions"]
  ),
  "family-people": buildLessonQuestionSet(
    "family-people",
    "Family and People",
    WORD_QUESTION_BANK["family-people"],
    SENTENCE_BUILDER_BANK["family-people"]
  ),
  "food-cooking": buildLessonQuestionSet(
    "food-cooking",
    "Food and Cooking",
    WORD_QUESTION_BANK["food-cooking"],
    SENTENCE_BUILDER_BANK["food-cooking"]
  ),
  "girl-and-skull": buildLessonQuestionSet(
    "girl-and-skull",
    "Girl and Skull",
    WORD_QUESTION_BANK["girl-and-skull"],
    SENTENCE_BUILDER_BANK["girl-and-skull"]
  ),
  "numbers-money": buildLessonQuestionSet(
    "numbers-money",
    "Numbers and Money",
    WORD_QUESTION_BANK["numbers-money"],
    SENTENCE_BUILDER_BANK["numbers-money"]
  ),
  "school-work": buildLessonQuestionSet(
    "school-work",
    "School and Work",
    WORD_QUESTION_BANK["school-work"],
    SENTENCE_BUILDER_BANK["school-work"]
  ),
  "tortoise-and-its-shell": buildLessonQuestionSet(
    "tortoise-and-its-shell",
    "Tortoise and its Shell",
    WORD_QUESTION_BANK["tortoise-and-its-shell"],
    SENTENCE_BUILDER_BANK["tortoise-and-its-shell"]
  ),
  "tortoise-and-dove": buildLessonQuestionSet(
    "tortoise-and-dove",
    "Tortoise and Dove",
    WORD_QUESTION_BANK["tortoise-and-dove"],
    SENTENCE_BUILDER_BANK["tortoise-and-dove"]
  ),
  transportation: buildLessonQuestionSet(
    "transportation",
    "Transportation",
    WORD_QUESTION_BANK.transportation,
    SENTENCE_BUILDER_BANK.transportation
  ),
  emotions: buildLessonQuestionSet(
    "emotions",
    "Emotions",
    WORD_QUESTION_BANK.emotions,
    SENTENCE_BUILDER_BANK.emotions
  ),
  health: buildLessonQuestionSet(
    "health",
    "Health",
    WORD_QUESTION_BANK.health,
    SENTENCE_BUILDER_BANK.health
  ),
  "household-objects": buildLessonQuestionSet(
    "household-objects",
    "Household Objects",
    WORD_QUESTION_BANK["household-objects"],
    SENTENCE_BUILDER_BANK["household-objects"]
  ),
  "mosquito-and-ear": buildLessonQuestionSet(
    "mosquito-and-ear",
    "Mosquito and Ear",
    WORD_QUESTION_BANK["mosquito-and-ear"],
    SENTENCE_BUILDER_BANK["mosquito-and-ear"]
  ),
  "pointing-things-out": buildLessonQuestionSet(
    "pointing-things-out",
    "Pointing Things Out",
    WORD_QUESTION_BANK["pointing-things-out"],
    SENTENCE_BUILDER_BANK["pointing-things-out"]
  ),
  "weather-nature": buildLessonQuestionSet(
    "weather-nature",
    "Weather and Nature",
    WORD_QUESTION_BANK["weather-nature"],
    SENTENCE_BUILDER_BANK["weather-nature"]
  ),
  animals: buildLessonQuestionSet(
    "animals",
    "Animals",
    WORD_QUESTION_BANK.animals,
    SENTENCE_BUILDER_BANK.animals
  ),
  elders: buildLessonQuestionSet(
    "elders",
    "Elders",
    WORD_QUESTION_BANK.elders,
    SENTENCE_BUILDER_BANK.elders
  ),
  celebrations: buildLessonQuestionSet(
    "celebrations",
    "Celebrations",
    WORD_QUESTION_BANK.celebrations,
    SENTENCE_BUILDER_BANK.celebrations
  ),
  colors: buildLessonQuestionSet(
    "colors",
    "Colors",
    WORD_QUESTION_BANK.colors,
    SENTENCE_BUILDER_BANK.colors
  ),
};

function toSvgComponent(moduleValue: any): ComponentType<any> {
  return (moduleValue?.default ?? moduleValue) as ComponentType<any>;
}

const QUESTION_VISUALS: Record<string, ComponentType<any>> = {
  "nouns-dog": toSvgComponent(require("./assets/questions/nouns-dog.svg")),
  "nouns-water": toSvgComponent(require("./assets/questions/nouns-water.svg")),
  "nouns-child": toSvgComponent(require("./assets/questions/nouns-child.svg")),
  "nouns-sun": toSvgComponent(require("./assets/questions/nouns-sun.svg")),
  "nouns-house": toSvgComponent(require("./assets/questions/nouns-house.svg")),
  "nouns-road": toSvgComponent(require("./assets/questions/nouns-road.svg")),
  "nouns-food": toSvgComponent(require("./assets/questions/nouns-food.svg")),
  "nouns-book": toSvgComponent(require("./assets/questions/nouns-book.svg")),
  "nouns-friend": toSvgComponent(require("./assets/questions/nouns-friend.svg")),
  "nouns-money": toSvgComponent(require("./assets/questions/nouns-money.svg")),
  "pronouns-i": toSvgComponent(require("./assets/questions/pronouns-i.svg")),
  "pronouns-you": toSvgComponent(require("./assets/questions/pronouns-you.svg")),
  "pronouns-he": toSvgComponent(require("./assets/questions/pronouns-he.svg")),
  "pronouns-she": toSvgComponent(require("./assets/questions/pronouns-she.svg")),
  "pronouns-we": toSvgComponent(require("./assets/questions/pronouns-we.svg")),
  "pronouns-they": toSvgComponent(require("./assets/questions/pronouns-they.svg")),
  "pronouns-me": toSvgComponent(require("./assets/questions/pronouns-me.svg")),
  "pronouns-us": toSvgComponent(require("./assets/questions/pronouns-us.svg")),
  "pronouns-them": toSvgComponent(require("./assets/questions/pronouns-them.svg")),
  "pronouns-my": toSvgComponent(require("./assets/questions/pronouns-my.svg")),
  "verbs-eat": toSvgComponent(require("./assets/questions/verbs-eat.svg")),
  "verbs-go": toSvgComponent(require("./assets/questions/verbs-go.svg")),
  "verbs-come": toSvgComponent(require("./assets/questions/verbs-come.svg")),
  "verbs-see": toSvgComponent(require("./assets/questions/verbs-see.svg")),
  "verbs-speak": toSvgComponent(require("./assets/questions/verbs-speak.svg")),
  "verbs-sleep": toSvgComponent(require("./assets/questions/verbs-sleep.svg")),
  "verbs-read": toSvgComponent(require("./assets/questions/verbs-read.svg")),
  "verbs-write": toSvgComponent(require("./assets/questions/verbs-write.svg")),
  "verbs-work": toSvgComponent(require("./assets/questions/verbs-work.svg")),
  "verbs-play": toSvgComponent(require("./assets/questions/verbs-play.svg")),
  "custom-everyday-verbs-a-na-m-aga-oru-kwa-ututu": toSvgComponent(require("./assets/questions/custom-everyday-verbs-a-na-m-aga-oru-kwa-ututu.svg")),
  "custom-everyday-verbs-anyi-na-ehi-ura-n-oge-izu": toSvgComponent(require("./assets/questions/custom-everyday-verbs-anyi-na-ehi-ura-n-oge-izu.svg")),
  "custom-everyday-verbs-ha-na-eri-osikapa-maka-nri-mgbede": toSvgComponent(require("./assets/questions/custom-everyday-verbs-ha-na-eri-osikapa-maka-nri-mgbede.svg")),
  "custom-everyday-verbs-i-na-eje-ije-ngwa-ngwa-nke-ukwuu": toSvgComponent(require("./assets/questions/custom-everyday-verbs-i-na-eje-ije-ngwa-ngwa-nke-ukwuu.svg")),
  "custom-everyday-verbs-o-biarutere-n-ulo-mgbe-e-mesiri": toSvgComponent(require("./assets/questions/custom-everyday-verbs-o-biarutere-n-ulo-mgbe-e-mesiri.svg")),
  "custom-everyday-verbs-o-na-anu-mmiri-mgbe-egwuregwu-bol-gachara": toSvgComponent(require("./assets/questions/custom-everyday-verbs-o-na-anu-mmiri-mgbe-egwuregwu-bol-gachara.svg")),
  "custom-everyday-verbs-umuaka-na-agba-oso": toSvgComponent(require("./assets/questions/custom-everyday-verbs-umuaka-na-agba-oso.svg")),
  "custom-greetings-a-bu-m-si": toSvgComponent(require("./assets/questions/custom-greetings-a-bu-m-si.svg")),
  "custom-greetings-achoro-m-mmiri": toSvgComponent(require("./assets/questions/custom-greetings-achoro-m-mmiri.svg")),
  "custom-greetings-aguu-na-agu-m": toSvgComponent(require("./assets/questions/custom-greetings-aguu-na-agu-m.svg")),
  "custom-greetings-aha-m-bu-udoka": toSvgComponent(require("./assets/questions/custom-greetings-aha-m-bu-udoka.svg")),
  "custom-greetings-amaghi-m": toSvgComponent(require("./assets/questions/custom-greetings-amaghi-m.svg")),
  "custom-greetings-ana-m-amu-igbo": toSvgComponent(require("./assets/questions/custom-greetings-ana-m-amu-igbo.svg")),
  "custom-greetings-bia-ebe-a": toSvgComponent(require("./assets/questions/custom-greetings-bia-ebe-a.svg")),
  "custom-greetings-biko-kwuo-ya-ozo": toSvgComponent(require("./assets/questions/custom-greetings-biko-kwuo-ya-ozo.svg")),
  "custom-asking-questions-ebee-ka-i-na-aga": toSvgComponent(require("./assets/questions/custom-asking-questions-ebee-ka-i-na-aga.svg")),
  "custom-asking-questions-gini-bu-aha-gi": toSvgComponent(require("./assets/questions/custom-asking-questions-gini-bu-aha-gi.svg")),
  "custom-asking-questions-gini-mere-i-ji-akwa-akwa": toSvgComponent(require("./assets/questions/custom-asking-questions-gini-mere-i-ji-akwa-akwa.svg")),
  "custom-asking-questions-onye-bu-onye-ahu": toSvgComponent(require("./assets/questions/custom-asking-questions-onye-bu-onye-ahu.svg")),
  "custom-animals-anumanu": toSvgComponent(require("./assets/questions/custom-animals-anumanu.svg")),
  "custom-animals-ehi": toSvgComponent(require("./assets/questions/custom-animals-ehi.svg")),
  "custom-animals-ewu": toSvgComponent(require("./assets/questions/custom-animals-ewu.svg")),
  "custom-animals-nkita": toSvgComponent(require("./assets/questions/custom-animals-nkita.svg")),
  "custom-animals-nnunu": toSvgComponent(require("./assets/questions/custom-animals-nnunu.svg")),
  "custom-animals-okuko": toSvgComponent(require("./assets/questions/custom-animals-okuko.svg")),
  "custom-animals-pusi": toSvgComponent(require("./assets/questions/custom-animals-pusi.svg")),
  "custom-celebrations-agbamakwukwo": toSvgComponent(require("./assets/questions/custom-celebrations-agbamakwukwo.svg")),
  "custom-celebrations-egwu": toSvgComponent(require("./assets/questions/custom-celebrations-egwu.svg")),
  "custom-celebrations-emume": toSvgComponent(require("./assets/questions/custom-celebrations-emume.svg")),
  "custom-celebrations-igu-aha-nwa": toSvgComponent(require("./assets/questions/custom-celebrations-igu-aha-nwa.svg")),
  "custom-celebrations-iri-ji-ohuru": toSvgComponent(require("./assets/questions/custom-celebrations-iri-ji-ohuru.svg")),
  "custom-celebrations-oriri": toSvgComponent(require("./assets/questions/custom-celebrations-oriri.svg")),
  "custom-celebrations-ubochi-omumu": toSvgComponent(require("./assets/questions/custom-celebrations-ubochi-omumu.svg")),
  "custom-elders-ngozi": toSvgComponent(require("./assets/questions/custom-elders-ngozi.svg")),
  "custom-elders-nna-ochie": toSvgComponent(require("./assets/questions/custom-elders-nna-ochie.svg")),
  "custom-elders-nne-ochie": toSvgComponent(require("./assets/questions/custom-elders-nne-ochie.svg")),
  "custom-elders-nsopuru": toSvgComponent(require("./assets/questions/custom-elders-nsopuru.svg")),
  "custom-elders-okenye": toSvgComponent(require("./assets/questions/custom-elders-okenye.svg")),
  "custom-elders-okenye-nwanyi": toSvgComponent(require("./assets/questions/custom-elders-okenye-nwanyi.svg")),
  "custom-elders-okenye-nwoke": toSvgComponent(require("./assets/questions/custom-elders-okenye-nwoke.svg")),
  "custom-emotions-anuri": toSvgComponent(require("./assets/questions/custom-emotions-anuri.svg")),
  "custom-emotions-egwu": toSvgComponent(require("./assets/questions/custom-emotions-egwu.svg")),
  "custom-emotions-ike-agwula": toSvgComponent(require("./assets/questions/custom-emotions-ike-agwula.svg")),
  "custom-emotions-iwe": toSvgComponent(require("./assets/questions/custom-emotions-iwe.svg")),
  "custom-emotions-mwute": toSvgComponent(require("./assets/questions/custom-emotions-mwute.svg")),
  "custom-emotions-obi-uto": toSvgComponent(require("./assets/questions/custom-emotions-obi-uto.svg")),
  "custom-emotions-udo": toSvgComponent(require("./assets/questions/custom-emotions-udo.svg")),
  "custom-family-people-nna": toSvgComponent(require("./assets/questions/custom-family-people-nna.svg")),
  "custom-family-people-nne": toSvgComponent(require("./assets/questions/custom-family-people-nne.svg")),
  "custom-family-people-nwanne-nwanyi": toSvgComponent(require("./assets/questions/custom-family-people-nwanne-nwanyi.svg")),
  "custom-family-people-nwanne-nwoke": toSvgComponent(require("./assets/questions/custom-family-people-nwanne-nwoke.svg")),
  "custom-food-cooking-mmiri": toSvgComponent(require("./assets/questions/custom-food-cooking-mmiri.svg")),
  "custom-food-cooking-nri": toSvgComponent(require("./assets/questions/custom-food-cooking-nri.svg")),
  "custom-food-cooking-ofe": toSvgComponent(require("./assets/questions/custom-food-cooking-ofe.svg")),
  "custom-food-cooking-osikapa": toSvgComponent(require("./assets/questions/custom-food-cooking-osikapa.svg")),
  "custom-health-ahuike": toSvgComponent(require("./assets/questions/custom-health-ahuike.svg")),
  "custom-health-dibia": toSvgComponent(require("./assets/questions/custom-health-dibia.svg")),
  "custom-health-mgbu": toSvgComponent(require("./assets/questions/custom-health-mgbu.svg")),
  "custom-health-ogwu": toSvgComponent(require("./assets/questions/custom-health-ogwu.svg")),
  "custom-health-onye-noosu": toSvgComponent(require("./assets/questions/custom-health-onye-noosu.svg")),
  "custom-health-oria": toSvgComponent(require("./assets/questions/custom-health-oria.svg")),
  "custom-health-ulo-ogwu": toSvgComponent(require("./assets/questions/custom-health-ulo-ogwu.svg")),
  "custom-household-objects-akwa": toSvgComponent(require("./assets/questions/custom-household-objects-akwa.svg")),
  "custom-household-objects-ime-ulo": toSvgComponent(require("./assets/questions/custom-household-objects-ime-ulo.svg")),
  "custom-household-objects-oche": toSvgComponent(require("./assets/questions/custom-household-objects-oche.svg")),
  "custom-household-objects-tebulu": toSvgComponent(require("./assets/questions/custom-household-objects-tebulu.svg")),
  "custom-household-objects-ulo": toSvgComponent(require("./assets/questions/custom-household-objects-ulo.svg")),
  "custom-household-objects-windo": toSvgComponent(require("./assets/questions/custom-household-objects-windo.svg")),
  "custom-numbers-money-abuo": toSvgComponent(require("./assets/questions/nouns-money.svg")),
  "custom-numbers-money-ano": toSvgComponent(require("./assets/questions/nouns-money.svg")),
  "custom-numbers-money-asaa": toSvgComponent(require("./assets/questions/nouns-money.svg")),
  "custom-numbers-money-ato": toSvgComponent(require("./assets/questions/nouns-money.svg")),
  "custom-numbers-money-ise": toSvgComponent(require("./assets/questions/nouns-money.svg")),
  "custom-numbers-money-isii": toSvgComponent(require("./assets/questions/nouns-money.svg")),
  "custom-numbers-money-otu": toSvgComponent(require("./assets/questions/nouns-money.svg")),
  "custom-school-work-akwukwo": toSvgComponent(require("./assets/questions/custom-school-work-akwukwo.svg")),
  "custom-school-work-guo": toSvgComponent(require("./assets/questions/custom-school-work-guo.svg")),
  "custom-school-work-klaasi": toSvgComponent(require("./assets/questions/custom-school-work-klaasi.svg")),
  "custom-school-work-mkpisi-ide": toSvgComponent(require("./assets/questions/custom-school-work-mkpisi-ide.svg")),
  "custom-school-work-nwata-akwukwo": toSvgComponent(require("./assets/questions/custom-school-work-nwata-akwukwo.svg")),
  "custom-school-work-onye-nkuzi": toSvgComponent(require("./assets/questions/custom-school-work-onye-nkuzi.svg")),
  "custom-school-work-ulo-akwukwo": toSvgComponent(require("./assets/questions/custom-school-work-ulo-akwukwo.svg")),
  "custom-transportation-igwe-kwu-otu-ebe": toSvgComponent(require("./assets/questions/custom-transportation-igwe-kwu-otu-ebe.svg")),
  "custom-transportation-okada": toSvgComponent(require("./assets/questions/custom-transportation-okada.svg")),
  "custom-transportation-onye-na-anya-ugbo-ala": toSvgComponent(require("./assets/questions/custom-transportation-onye-na-anya-ugbo-ala.svg")),
  "custom-transportation-taksi": toSvgComponent(require("./assets/questions/custom-transportation-taksi.svg")),
  "custom-transportation-ugbo-ala": toSvgComponent(require("./assets/questions/custom-transportation-ugbo-ala.svg")),
  "custom-transportation-ugbo-njem": toSvgComponent(require("./assets/questions/custom-transportation-ugbo-njem.svg")),
  "custom-transportation-uzo": toSvgComponent(require("./assets/questions/custom-transportation-uzo.svg")),
  "custom-weather-nature-anyanwu": toSvgComponent(require("./assets/questions/custom-weather-nature-anyanwu.svg")),
  "custom-weather-nature-ifufe": toSvgComponent(require("./assets/questions/custom-weather-nature-ifufe.svg")),
  "custom-weather-nature-igwe-ojii": toSvgComponent(require("./assets/questions/custom-weather-nature-igwe-ojii.svg")),
  "custom-weather-nature-ihu-igwe": toSvgComponent(require("./assets/questions/custom-weather-nature-ihu-igwe.svg")),
  "custom-weather-nature-mmiri-ozuzo": toSvgComponent(require("./assets/questions/custom-weather-nature-mmiri-ozuzo.svg")),
  "custom-weather-nature-oke-ifufe": toSvgComponent(require("./assets/questions/custom-weather-nature-oke-ifufe.svg")),
  "custom-weather-nature-oyi": toSvgComponent(require("./assets/questions/custom-weather-nature-oyi.svg")),

  // Past, Present & Future Tenses
  "tenses-present-eat": toSvgComponent(require("./assets/questions/tenses-present-eat.svg")),
  "tenses-present-go": toSvgComponent(require("./assets/questions/tenses-present-go.svg")),
  "tenses-present-learn": toSvgComponent(require("./assets/questions/tenses-present-learn.svg")),
  "tenses-past-eat": toSvgComponent(require("./assets/questions/tenses-past-eat.svg")),
  "tenses-past-go": toSvgComponent(require("./assets/questions/tenses-past-go.svg")),
  "tenses-past-learn": toSvgComponent(require("./assets/questions/tenses-past-learn.svg")),
  "tenses-future-eat": toSvgComponent(require("./assets/questions/tenses-future-eat.svg")),
  "tenses-future-go": toSvgComponent(require("./assets/questions/tenses-future-go.svg")),
  "tenses-future-learn": toSvgComponent(require("./assets/questions/tenses-future-learn.svg")),

  // Describing Things (Adjectives)
  "adjectives-big-house": toSvgComponent(require("./assets/questions/adjectives-big-house.svg")),
  "adjectives-good-person": toSvgComponent(require("./assets/questions/adjectives-good-person.svg")),
  "adjectives-small-child": toSvgComponent(require("./assets/questions/adjectives-small-child.svg")),
  "adjectives-beautiful-woman": toSvgComponent(require("./assets/questions/adjectives-beautiful-woman.svg")),
  "adjectives-house-is-big": toSvgComponent(require("./assets/questions/adjectives-house-is-big.svg")),
  "adjectives-food-is-good": toSvgComponent(require("./assets/questions/adjectives-food-is-good.svg")),
  "adjectives-water-is-cold": toSvgComponent(require("./assets/questions/adjectives-water-is-cold.svg")),
  "adjectives-food-very-good": toSvgComponent(require("./assets/questions/adjectives-food-very-good.svg")),
  "adjectives-child-strong": toSvgComponent(require("./assets/questions/adjectives-child-strong.svg")),

  // Time & Dates
  "time-today": toSvgComponent(require("./assets/questions/time-today.svg")),
  "time-yesterday": toSvgComponent(require("./assets/questions/time-yesterday.svg")),
  "time-tomorrow": toSvgComponent(require("./assets/questions/time-tomorrow.svg")),
  "time-oclock": toSvgComponent(require("./assets/questions/time-oclock.svg")),
  "time-morning": toSvgComponent(require("./assets/questions/time-morning.svg")),
  "time-evening": toSvgComponent(require("./assets/questions/time-evening.svg")),
  "time-this-week": toSvgComponent(require("./assets/questions/time-this-week.svg")),
  "time-last-week": toSvgComponent(require("./assets/questions/time-last-week.svg")),
  "time-next-week": toSvgComponent(require("./assets/questions/time-next-week.svg")),

  // Travel & Culture
  "travel-journey": toSvgComponent(require("./assets/questions/travel-journey.svg")),
  "travel-market": toSvgComponent(require("./assets/questions/travel-market.svg")),
  "travel-going": toSvgComponent(require("./assets/questions/travel-going.svg")),
  "travel-village-square": toSvgComponent(require("./assets/questions/travel-village-square.svg")),
  "travel-family-home": toSvgComponent(require("./assets/questions/travel-family-home.svg")),
  "travel-sibling": toSvgComponent(require("./assets/questions/travel-sibling.svg")),
  "travel-celebration": toSvgComponent(require("./assets/questions/travel-celebration.svg")),
  "travel-visit-family": toSvgComponent(require("./assets/questions/travel-visit-family.svg")),
  "travel-hometown": toSvgComponent(require("./assets/questions/travel-hometown.svg")),
};

const LESSON_DEFS = [
  { id: "introduction-to-igbo", title: "Introduction to Igbo" },
  { id: "getting-started", title: "Getting Started" },
  { id: "greetings", title: "Greetings" },
  { id: "everyday-verbs", title: "Everyday Verbs" },
  { id: "adjectives", title: "Describing Things" },
  { id: "asking-questions", title: "Asking Questions" },
  { id: "family-people", title: "Family and People" },
  { id: "food-cooking", title: "Food and Cooking" },
  { id: "numbers-money", title: "Numbers and Money" },
  { id: "shopping-bargaining", title: "Shopping & Bargaining" },
  { id: "tenses", title: "Past, Present & Future" },
  { id: "time-dates", title: "Time & Dates" },
  { id: "travel-culture", title: "Travel & Culture" },
  { id: "school-work", title: "School and Work" },
  { id: "girl-and-skull", title: "Girl and Skull" },
  { id: "mosquito-and-ear", title: "Mosquito and Ear" },
  { id: "tortoise-and-its-shell", title: "Tortoise and its Shell" },
  { id: "tortoise-and-dove", title: "Tortoise and Dove" },
  { id: "transportation", title: "Transportation" },
  { id: "emotions", title: "Emotions" },
  { id: "health", title: "Health" },
  { id: "colors", title: "Colors" },
  { id: "household-objects", title: "Household Objects" },
  { id: "pointing-things-out", title: "Pointing Things Out" },
  { id: "weather-nature", title: "Weather and Nature" },
  { id: "animals", title: "Animals" },
  { id: "opinions-debate", title: "Opinions & Debate" },
  { id: "elders", title: "Elders" },
  { id: "celebrations", title: "Celebrations" },
  { id: "proverbs-idioms", title: "Idioms & Proverbs" },

];

const ACTIVE_QUESTION_BANK: Record<string, Question[]> = QUESTION_BANK;

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
  const [completedDayKeys, setCompletedDayKeys] = useState<string[]>([]);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [isHintModalOpen, setIsHintModalOpen] = useState(false);
  const [audioPlaybackRate, setAudioPlaybackRate] = useState<0.5 | 1>(1);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
  const [isAuthBusy, setIsAuthBusy] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const isAudioLoadingRef = useRef(false);
  const isAudioPlayingRef = useRef(false);
  const activePlayerRef = useRef<ReturnType<typeof createAudioPlayer> | null>(
    null
  );
  const activePlayerSubscriptionRef = useRef<RemovableSubscription | null>(null);
  const currentActiveAudioKeyRef = useRef<string | null>(null);
  const feedbackPlayerRef = useRef<ReturnType<typeof createAudioPlayer> | null>(
    null
  );
  const sentencePlayerRef = useRef<ReturnType<typeof createAudioPlayer> | null>(
    null
  );
  const sentencePlayerSubscriptionRef = useRef<RemovableSubscription | null>(null);
  const currentSentenceAudioKeyRef = useRef<string | null>(null);
  const [isSentenceAudioLoading, setIsSentenceAudioLoading] = useState(false);
  const [isSentenceAudioPlaying, setIsSentenceAudioPlaying] = useState(false);

  useEffect(() => {
    const restorePremiumState = async () => {
      try {
        const savedPremium = await AsyncStorage.getItem(PREMIUM_UNLOCK_STORAGE_KEY);

        const unlocked = savedPremium === "true";
        setHasPremiumAccess(unlocked);

        try {
          const hasActiveSubscription = await restorePremiumStatus();
          setHasPremiumAccess(hasActiveSubscription);

          await AsyncStorage.setItem(
            PREMIUM_UNLOCK_STORAGE_KEY,
            hasActiveSubscription ? "true" : "false"
          );
        } catch {
          // Keep locally cached premium state if remote status cannot load.
        }
      } catch {
        setHasPremiumAccess(false);
      }
    };

    void restorePremiumState();
  }, []);

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
        const persistedCompletedDayKeys =
          isPersistedProgress(parsed) && Array.isArray(parsed.completedDayKeys)
            ? parsed.completedDayKeys
            : Object.values(completedOnByLesson).filter(
              (value): value is string => typeof value === "string"
            );

        setCompletedDayKeys(normalizeCompletedDayKeys(persistedCompletedDayKeys));

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
      completedDayKeys,
    };

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload)).catch(() => {
      // Best effort persistence.
    });
  }, [completedDayKeys, lessons]);

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
  const streakCount = useMemo(
    () => calculateStreakCount(completedDayKeys, todayKey),
    [completedDayKeys, todayKey]
  );
  const hasCompletedLessonToday = completedDayKeys.includes(todayKey);

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
    if (!activeQuestion) {
      return [];
    }

    const sentenceAssembly =
      activeQuestion.sentenceBreakdown ?? activeQuestion.sentenceBuilder;

    if (sentenceAssembly) {
      return [
        {
          word: activeQuestion.answer,
          meaning: sentenceAssembly.sourceSentence,
        },
      ];
    }

    if (activeLessonId === "greetings") {
      return [
        {
          word: activeQuestion.answer,
          meaning:
            GREETINGS_TRANSLATIONS[activeQuestion.answer] ?? "Translation pending",
        },
      ];
    }

    return [
      {
        word: activeQuestion.answer,
        meaning: activeQuestion.prompt,
      },
    ];
  }, [activeLessonId, activeQuestion]);

  const activeChoices = useMemo(() => {
    if (
      !activeLessonId ||
      !activeQuestion ||
      activeQuestion.sentenceBuilder ||
      activeQuestion.sentenceBreakdown
    ) {
      return [];
    }

    return buildLessonChoices(activeLessonId, activeQuestion);
  }, [activeLessonId, activeQuestion]);

  useEffect(() => {
    return () => {
      if (sentencePlayerSubscriptionRef.current) {
        sentencePlayerSubscriptionRef.current.remove();
        sentencePlayerSubscriptionRef.current = null;
      }

      if (sentencePlayerRef.current) {
        sentencePlayerRef.current.remove();
        sentencePlayerRef.current = null;
      }

      if (activePlayerSubscriptionRef.current) {
        activePlayerSubscriptionRef.current.remove();
        activePlayerSubscriptionRef.current = null;
      }

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

  const playSentenceBreakdownAudio = useCallback(async (audioKey?: string) => {
    const resolvedAudioKey = audioKey ?? activeQuestion?.audioKey;

    if (
      !resolvedAudioKey ||
      isSentenceAudioLoading ||
      isSentenceAudioPlaying
    ) {
      return;
    }

    const clip =
      SENTENCE_BREAKDOWNS_EXAMPLE_IGBO_AUDIO[resolvedAudioKey] ??
      SENTENCE_BREAKDOWNS_IGBO_AUDIO[resolvedAudioKey] ??
      SENTENCE_BREAKDOWNS_AUDIO[resolvedAudioKey] ??
      QUESTION_AUDIO[resolvedAudioKey];
    if (!clip) {
      return;
    }

    try {
      setIsSentenceAudioLoading(true);
      setIsSentenceAudioPlaying(false);
      currentSentenceAudioKeyRef.current = resolvedAudioKey;

      if (sentencePlayerSubscriptionRef.current) {
        sentencePlayerSubscriptionRef.current.remove();
        sentencePlayerSubscriptionRef.current = null;
      }

      if (sentencePlayerRef.current) {
        sentencePlayerRef.current.remove();
        sentencePlayerRef.current = null;
      }

      await setAudioModeAsync({
        playsInSilentMode: true,
        interruptionMode: "mixWithOthers",
      });

      const player = createAudioPlayer(clip, {
        keepAudioSessionActive: true,
      });
      sentencePlayerRef.current = player;
      player.loop = false;
      player.setPlaybackRate(audioPlaybackRate);

      sentencePlayerSubscriptionRef.current = player.addListener(
        "playbackStatusUpdate",
        (status) => {
          setIsSentenceAudioLoading(status.isBuffering);

          const statusRecord = status as unknown as {
            isPlaying?: boolean;
            playing?: boolean;
            isBuffering?: boolean;
          };
          const currentlyPlaying =
            statusRecord.isPlaying ?? statusRecord.playing ?? false;

          if (!currentlyPlaying && !statusRecord.isBuffering) {
            setIsSentenceAudioPlaying(false);
          }
        }
      );

      player.play();
      setIsSentenceAudioLoading(false);
      setIsSentenceAudioPlaying(true);
    } catch {
      setIsSentenceAudioLoading(false);
      setIsSentenceAudioPlaying(false);
    }
  }, [activeQuestion?.audioKey, audioPlaybackRate, isSentenceAudioLoading, isSentenceAudioPlaying]);

  const toggleAudioPlaybackRate = useCallback(() => {
    setAudioPlaybackRate((currentRate) => {
      const nextRate: 0.5 | 1 = currentRate === 1 ? 0.5 : 1;

      if (activePlayerRef.current) {
        activePlayerRef.current.setPlaybackRate(nextRate);
      }

      if (sentencePlayerRef.current) {
        sentencePlayerRef.current.setPlaybackRate(nextRate);
      }

      const currentSentenceAudioKey = currentSentenceAudioKeyRef.current;
      if (currentSentenceAudioKey) {
        queueMicrotask(() => {
          if (sentencePlayerRef.current) {
            sentencePlayerRef.current.remove();
            sentencePlayerRef.current = null;
          }

          if (sentencePlayerSubscriptionRef.current) {
            sentencePlayerSubscriptionRef.current.remove();
            sentencePlayerSubscriptionRef.current = null;
          }

          setIsSentenceAudioPlaying(false);
          setIsSentenceAudioLoading(false);
          void playSentenceBreakdownAudio(currentSentenceAudioKey);
        });
      }

      return nextRate;
    });
  }, [playSentenceBreakdownAudio]);

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
    const lessonIndex = lessons.findIndex((item) => item.id === lessonId);
    const isPremiumLocked = lessonIndex >= 5 && !hasPremiumAccess;

    if (!lesson || lesson.totalQuestions === 0 || isPremiumLocked) {
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

  const handleLoginPress = useCallback(() => {
    if (isAuthBusy) {
      return;
    }

    if (hasPremiumAccess) {
      Alert.alert("Premium", "Your premium access is already active.");
      return;
    }

    setScreen("premium");
  }, [hasPremiumAccess, isAuthBusy]);

  const handleGetStarted = useCallback(() => {
    if (isAuthBusy) {
      return;
    }

    setIsLoggedIn(true);
    setScreen("lessons");
  }, [isAuthBusy]);

  const handleLogout = useCallback(async () => {
    if (isAuthBusy) {
      return;
    }

    setIsAuthBusy(true);

    try {
      await AsyncStorage.removeItem(PREMIUM_UNLOCK_STORAGE_KEY);
      await logoutPremiumAccess();
      setIsLoggedIn(false);
      setHasPremiumAccess(false);
      setScreen("home");
    } finally {
      setIsAuthBusy(false);
    }
  }, [isAuthBusy]);

  const handlePremiumPurchase = useCallback(async (plan: "annual" | "monthly") => {
    setIsAuthBusy(true);

    try {
      const productId =
        plan === "annual"
          ? PREMIUM_ANNUAL_PRODUCT_ID
          : PREMIUM_MONTHLY_PRODUCT_ID;
      const hasPremium = await purchasePremiumAccess(productId);

      if (!hasPremium) {
        throw new Error(
          "Purchase completed but premium access is not active yet."
        );
      }

      if (__DEV__) {
        Alert.alert(
          "Premium debug",
          `Access matched by ${getLastPremiumAccessReason()}`
        );
      }

      setHasPremiumAccess(true);
      setIsLoggedIn(true);
      await AsyncStorage.setItem(PREMIUM_UNLOCK_STORAGE_KEY, "true");
      setScreen("lessons");
      Alert.alert("Premium active", "Your subscription is now active.");
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Upgrade failed. Try again.";
      const friendlyMessage =
        message.includes("No subscription products are currently available") ||
          message.includes("SKU not found")
          ? "No Apple subscription product is available to this build yet. Confirm premium_annual_igbo_easy and premium_monthly_igbo_easy have complete metadata in App Store Connect, then add at least one subscription to this app version under In-App Purchases and Subscriptions before submitting for App Review."
          : message;
      Alert.alert("Upgrade unavailable", friendlyMessage);
    } finally {
      setIsAuthBusy(false);
    }
  }, []);

  const handleAppAppleSignInRestore = useCallback(async () => {
    try {
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert(
          "Not Available",
          "Apple Authentication is not supported on this device's system version."
        );
        return;
      }

      setIsAuthBusy(true);

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (credential.identityToken) {
        // Authenticate/unlock premium
        setHasPremiumAccess(true);
        setIsLoggedIn(true);
        await AsyncStorage.setItem(PREMIUM_UNLOCK_STORAGE_KEY, "true");
        setScreen("lessons");
        Alert.alert(
          "Restore successful",
          "This Apple ID has an active subscription."
        );
      } else {
        Alert.alert("Authentication failed", "No valid credentials found.");
      }
    } catch (error: any) {
      if (error?.code !== "ERR_REQUEST_CANCELED") {
        Alert.alert("Sign In Error", error?.message || "An error occurred with Apple Sign In.");
      }
    } finally {
      setIsAuthBusy(false);
    }
  }, []);

  const handleRestorePurchases = useCallback(async () => {
    if (isAuthBusy) {
      return;
    }

    setIsAuthBusy(true);

    try {
      // First try normal subscription query, if not, provide choice to restore via Apple Sign In
      const restored = await restorePremiumPurchases();

      if (restored) {
        setHasPremiumAccess(true);
        setIsLoggedIn(true);
        await AsyncStorage.setItem(PREMIUM_UNLOCK_STORAGE_KEY, "true");
        setScreen("lessons");
        Alert.alert("Premium restored", "Your Premium access is active again.");
        return;
      }

      // No active purchase was returned on IAP restore. Provide an Apple Sign In route!
      Alert.alert(
        "IAP Restore Empty",
        "No Active App Store purchase found. Would you like to restore by logging into the Apple ID used to subscribe?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Restore via Apple Sign In",
            onPress: () => {
              // Defer execution outside original try task blocks
              setTimeout(() => {
                handleAppAppleSignInRestore();
              }, 100);
            },
          },
        ]
      );
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Restore failed. Try again.";
      Alert.alert("Restore unavailable", message);
    } finally {
      setIsAuthBusy(false);
    }
  }, [isAuthBusy, handleAppAppleSignInRestore]);

  const playActiveAudio = useCallback(async () => {
    const resolvedAudioKey = activeQuestion?.audioKey;
    if (!resolvedAudioKey) {
      return;
    }

    const isSameAudio = currentActiveAudioKeyRef.current === resolvedAudioKey;
    if ((isAudioPlayingRef.current || isAudioLoadingRef.current) && isSameAudio) {
      return;
    }

    const clip = QUESTION_AUDIO[resolvedAudioKey] || SENTENCE_BREAKDOWNS_AUDIO[resolvedAudioKey];
    if (!clip) {
      return;
    }

    try {
      setIsAudioLoading(true);
      setIsAudioPlaying(false);
      isAudioLoadingRef.current = true;
      isAudioPlayingRef.current = false;
      currentActiveAudioKeyRef.current = resolvedAudioKey;

      if (activePlayerSubscriptionRef.current) {
        activePlayerSubscriptionRef.current.remove();
        activePlayerSubscriptionRef.current = null;
      }

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
      player.loop = false;

      activePlayerSubscriptionRef.current = player.addListener(
        "playbackStatusUpdate",
        (status) => {
          setIsAudioLoading(status.isBuffering);
          isAudioLoadingRef.current = status.isBuffering;

          const statusRecord = status as unknown as {
            isPlaying?: boolean;
            playing?: boolean;
            isBuffering?: boolean;
          };
          const currentlyPlaying =
            statusRecord.isPlaying ?? statusRecord.playing ?? false;

          setIsAudioPlaying(currentlyPlaying);
          isAudioPlayingRef.current = currentlyPlaying;

          if (!currentlyPlaying && !statusRecord.isBuffering) {
            currentActiveAudioKeyRef.current = null;
          }
        }
      );

      player.setPlaybackRate(audioPlaybackRate);
      player.play();

      setIsAudioLoading(false);
      setIsAudioPlaying(true);
      isAudioLoadingRef.current = false;
      isAudioPlayingRef.current = true;
    } catch {
      setIsAudioLoading(false);
      setIsAudioPlaying(false);
      isAudioLoadingRef.current = false;
      isAudioPlayingRef.current = false;
      currentActiveAudioKeyRef.current = null;
      // Ignore audio playback errors.
    }
  }, [activeQuestion, audioPlaybackRate]);

  useEffect(() => {
    void syncDailyLessonReminderNotifications({
      hasCompletedLessonToday,
    });
  }, [hasCompletedLessonToday]);

  const handleDemoReminderTest = useCallback(async () => {
    try {
      const result = await scheduleDemoLessonReminderNotifications();

      if (!result.hasPermission) {
        Alert.alert(
          "Notifications blocked",
          "Enable notifications to test reminder push alerts."
        );
        return;
      }

      Alert.alert(
        "Demo reminders scheduled",
        "Morning and night reminder pushes will appear in a few seconds."
      );
    } catch {
      Alert.alert("Demo failed", "Could not schedule reminder notifications.");
    }
  }, []);

  useEffect(() => {
    if (activePlayerSubscriptionRef.current) {
      activePlayerSubscriptionRef.current.remove();
      activePlayerSubscriptionRef.current = null;
    }

    if (activePlayerRef.current) {
      activePlayerRef.current.remove();
      activePlayerRef.current = null;
    }

    setIsAudioLoading(false);
    setIsAudioPlaying(false);
    isAudioLoadingRef.current = false;
    isAudioPlayingRef.current = false;
    currentActiveAudioKeyRef.current = null;
    setIsSentenceAudioLoading(false);
    setIsSentenceAudioPlaying(false);
    currentSentenceAudioKeyRef.current = null;
  }, [activeQuestion?.answer]);

  const checkCurrentAnswer = () => {
    if (!activeQuestion) {
      return;
    }

    const normalizedInput = normalizeAnswer(userAnswer);
    const normalizedExpected = normalizeAnswer(
      activeQuestion.storyMode
        ? activeQuestion.storyMode.correctAnswer
          ? "True"
          : "False"
        : activeQuestion.answer
    );
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

      if (completedLesson) {
        setCompletedDayKeys((currentKeys) =>
          normalizeCompletedDayKeys([...currentKeys, todayKey])
        );
      }

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

  const previousSentenceBreakdownQuestion = useCallback(() => {
    if (!activeLessonId) {
      return;
    }

    setLessons((currentLessons) =>
      currentLessons.map((lesson) => {
        if (lesson.id !== activeLessonId) {
          return lesson;
        }

        return {
          ...lesson,
          answeredQuestions: Math.max(0, lesson.answeredQuestions - 1),
        };
      })
    );
  }, [activeLessonId]);

  const continueSentenceBreakdownLesson = useCallback(() => {
    if (!activeLessonId) {
      return;
    }

    const lessonBeforeUpdate = lessons.find((lesson) => lesson.id === activeLessonId);
    if (!lessonBeforeUpdate) {
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

    if (completedLesson) {
      setCompletedDayKeys((currentKeys) =>
        normalizeCompletedDayKeys([...currentKeys, todayKey])
      );
      setScreen("completed");
    }
  }, [activeLessonId, lessons, todayKey]);

  if (!fontsLoaded) {
    return null;
  }

  const currentGroup: AppGroup =
    screen === "home" ? "home" : screen === "quiz" ? "game" : "lesson";

  if (currentGroup === "home") {
    return (
      <HomeGroup
        onGetStarted={handleGetStarted}
        onDemoReminderTest={handleDemoReminderTest}
        onTogglePremium={__DEV__ ? () => setHasPremiumAccess((v) => !v) : undefined}
        hasPremiumAccess={hasPremiumAccess}
        styles={styles}
      />
    );
  }

  if (currentGroup === "lesson") {
    return (
      <LessonGroup
        screen={screen}
        activeLessonTitle={activeLesson?.title ?? null}
        renderLessons={() => (
          screen === "streak" ? (
            <StreakScreen
              completedDayKeys={completedDayKeys}
              streakCount={streakCount}
              onBack={() => setScreen("lessons")}
            />
          ) : screen === "premium" ? (
            <PremiumScreen
              onBack={() => setScreen("lessons")}
              onContinue={handlePremiumPurchase}
              onRestorePurchases={handleRestorePurchases}
              isAuthBusy={isAuthBusy}
            />
          ) : (
            <LessonsScreen
              lessons={lessons}
              overallProgress={overallProgress}
              streakCount={streakCount}
              isLoggedIn={isLoggedIn}
              hasPremiumAccess={hasPremiumAccess}
              isAuthBusy={isAuthBusy}
              onLoginPress={handleLoginPress}
              onLogoutPress={handleLogout}
              onOpenStreakScreen={() => setScreen("streak")}
              onOpenHome={() => setScreen("home")}
              onStartLesson={startLesson}
            />
          )
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
    if (activeQuestion.sentenceBreakdown) {
      return (
        <SentenceBreakdownLessonScreen
          question={activeQuestion}
          lessonIndex={activeLesson.answeredQuestions}
          lessonCount={activeLesson.totalQuestions}
          onExit={closeQuiz}
          onNextQuestion={continueSentenceBreakdownLesson}
          onPreviousQuestion={previousSentenceBreakdownQuestion}
          onPlayAudio={playSentenceBreakdownAudio}
          onPlayFeedbackSound={playFeedbackSound}
          audioPlaybackRate={audioPlaybackRate}
          onToggleAudioPlaybackRate={toggleAudioPlaybackRate}
          isAudioLoading={isSentenceAudioLoading}
          isAudioPlaying={isSentenceAudioPlaying}
        />
      );
    }

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
            showSpeaker={Boolean(
              question.audioKey && (QUESTION_AUDIO[question.audioKey] || SENTENCE_BREAKDOWNS_AUDIO[question.audioKey])
            )}
            onPlayAudio={playActiveAudio}
            audioPlaybackRate={audioPlaybackRate}
            onToggleAudioPlaybackRate={toggleAudioPlaybackRate}
            isAudioLoading={isAudioLoading}
            isAudioPlaying={isAudioPlaying}
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
      isLoggedIn={isLoggedIn}
      hasPremiumAccess={hasPremiumAccess}
      isAuthBusy={isAuthBusy}
      onLoginPress={handleLoginPress}
      onLogoutPress={handleLogout}
      onOpenStreakScreen={() => setScreen("streak")}
      onOpenHome={() => setScreen("home")}
      onStartLesson={startLesson}
    />
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

function buildLessonQuestionSet(
  lessonId: string,
  _lessonTitle: string,
  wordQuestions: Question[],
  sentenceSeeds: SentenceBuilderSeed[]
): Question[] {
  const mixedQuestions = buildMixedQuestionSet(wordQuestions, sentenceSeeds);
  const storyQuestions = buildStoryQuestions(lessonId);

  return [
    ...storyQuestions,
    ...mixedQuestions,
  ];
}

function buildIntroductionToIgboBreakdownSeeds(): SentenceBreakdownSeed[] {
  return [
    {
      sourceSentence: "What is your name?",
      targetWords: ["Gini", "bu", "aha", "gi"],
      distractors: ["m", "anyi", "nke", "ebe"],
      igboRule: "'Gini' means 'what,' 'bu' means 'is,' 'aha' means 'name,' and 'gi' means 'your.'",
      anotherExample: {
        igbo: "Gini bu aha nwa gi?",
        english: "What is your child's name?",
      },
      illustrationKey: "What is your name",
      audioKey: "what-is-your-name",
    },
    {
      sourceSentence: "How are you?",
      targetWords: ["Kedu", "ka", "i", "mere"],
      distractors: ["anyi", "ha", "m", "bu"],
      igboRule: "'Kedu ka' is a common way to say 'how are you?' 'I' means 'you' and 'mere' finishes the question.",
      anotherExample: {
        igbo: "Kedu ka ha mere?",
        english: "How are they?",
      },
      illustrationKey: "How are you",
      audioKey: "how-are-you",
    },
    {
      sourceSentence: "I want to go home.",
      targetWords: ["Achoro", "m", "iju", "ụlọ"],
      distractors: ["na", "ebe", "ka", "ha"],
      igboRule: "'Achoro m' means 'I want.' 'Iju' means 'go,' and 'ụlọ' means 'home.'",
      anotherExample: {
        igbo: "Achoro m iri nri.",
        english: "I want to eat food.",
      },
      illustrationKey: "I want to go home",
      audioKey: "i-want-to-go-home",
    },
    {
      sourceSentence: "I do not understand.",
      targetWords: ["Amaghi", "m"],
      distractors: ["chi", "ka", "bu", "ebe"],
      igboRule: "'Amaghi m' is a simple way to say 'I do not understand' or 'I do not know.'",
      anotherExample: {
        igbo: "Amaghi m okwu gi.",
        english: "I do not understand your words.",
      },
      illustrationKey: "I do not understand",
      audioKey: "i-do-not-understand",
    },
    {
      sourceSentence: "I am hungry.",
      targetWords: ["Aguu", "na", "agu", "m"],
      distractors: ["chi", "afo", "ike", "okwu"],
      igboRule: "Igbo says this like 'hunger is on me.' 'M' means 'me.'",
      anotherExample: {
        igbo: "Aguu na agu ha.",
        english: "They are hungry.",
      },
      illustrationKey: "I am hungry",
      audioKey: "i-am-hungry",
    },
    {
      sourceSentence: "I have two brothers.",
      targetWords: ["Nwanne", "m", "ndị", "nwoke", "abụọ"],
      distractors: ["ogidi", "mmadụ", "nwa", "ha"],
      igboRule: "'Nwanne m' means 'my sibling.' 'Ndị nwoke' means 'brothers/men,' and 'abụọ' means 'two.'",
      anotherExample: {
        igbo: "Nwanne m ndị nwanyị atọ.",
        english: "I have three sisters.",
      },
      illustrationKey: "I have two brothers",
      audioKey: "i-have-two-brothers",
    },
    {
      sourceSentence: "I will come tomorrow.",
      targetWords: ["Ga", "m", "abịa", "echi"],
      distractors: ["na", "si", "ije", "nke"],
      igboRule: "'Ga m' means 'I will.' 'Abịa' means 'come,' and 'echi' means 'tomorrow.'",
      anotherExample: {
        igbo: "Ga a ị gaa n'ụlọ?",
        english: "Will you go home?",
      },
      illustrationKey: "I will come tomorrow",
      audioKey: "i-will-come-tomorrow",
    },
    {
      sourceSentence: "Where is our sister?",
      targetWords: ["Ebe", "ka", "nne", "anyi", "no"],
      distractors: ["di", "na", "gi", "bu"],
      igboRule: "'Ebe' means 'where,' 'anyi' means 'our,' and 'no' means 'is there' or 'stays there.'",
      anotherExample: {
        igbo: "Ebe ka nne gi no?",
        english: "Where is your mother?",
      },
      illustrationKey: "Where is our sister",
      audioKey: "where-is-our-sister",
    },
    {
      sourceSentence: "They are tired.",
      targetWords: ["Ha", "wụrụ", "ngwu"],
      distractors: ["ga", "na", "di", "cho"],
      igboRule: "'Ha' means 'they,' and 'wụrụ ngwu' means 'got tired' or 'are tired.'",
      anotherExample: {
        igbo: "Ọ wụrụ ngwu.",
        english: "He/she is tired.",
      },
      illustrationKey: "They are tired",
      audioKey: "they-are-tired",
    },
    {
      sourceSentence: "We are thirsty.",
      targetWords: ["Anyi", "na", "agụ", "mmili"],
      distractors: ["ha", "m", "gi", "ebe"],
      igboRule: "'Anyi' means 'we.' In Igbo, thirst is said like 'we want water.'",
      anotherExample: {
        igbo: "O na agụ mmili.",
        english: "He/she is thirsty.",
      },
      illustrationKey: "We are thirsty",
      audioKey: "we-are-thirsty",
    },
  ];
}

function buildGettingStartedBreakdownSeeds(): SentenceBreakdownSeed[] {
  return [
    {
      sourceSentence: "Give him water.",
      targetWords: ["Nye", "ya", "mmili"],
      distractors: ["ka", "nke", "bu", "na"],
      igboRule: "'Nye' means 'give,' 'ya' means 'him' or 'her,' and 'mmili' means 'water.'",
      anotherExample: {
        igbo: "Nye m ihe.",
        english: "Give me something.",
      },
      illustrationKey: "Give him water",
      audioKey: "give-him-water",
    },
    {
      sourceSentence: "He is going to the river to fetch water.",
      targetWords: ["O", "na", "eje", "n'ime", "mmiri", "iji", "kpukuru", "mmili"],
      distractors: ["ha", "ka", "m", "di"],
      igboRule: "This says he is going to the river for water. 'O' means 'he,' and 'na eje' means 'is going.'",
      anotherExample: {
        igbo: "Ha na eje n'ụlọ.",
        english: "They are going to the house.",
      },
      illustrationKey: "He is going to the river to fetch water",
      audioKey: "he-is-going-to-the-river-to-fetch-water",
    },
    {
      sourceSentence: "I am going to see my father at the farm.",
      targetWords: ["Ga", "m", "ahụ", "pa", "m", "n'ibe"],
      distractors: ["na", "eme", "di", "si"],
      igboRule: "'Ga m' means 'I am going to.' 'Ahụ' means 'see,' 'pa m' means 'my father,' and 'n'ibe' means 'at the farm.'",
      anotherExample: {
        igbo: "Ga m ahụ nne m n'afo.",
        english: "I am going to see my mother at home.",
      },
      illustrationKey: "I am going to see my father at the farm",
      audioKey: "i-am-going-to-see-my-father-at-the-farm",
    },
    {
      sourceSentence: "If it rains, we will stay at home.",
      targetWords: ["Ọ", "bụrụ", "na", "ewe", "anyi", "ga", "nọdụ", "n'ụlọ"],
      distractors: ["ha", "ka", "m", "iji"],
      igboRule: "'Ọ bụrụ na' means 'if.' The rest says 'it rains, we will stay home.'",
      anotherExample: {
        igbo: "Ọ bụrụ na ọ no mma, anyi ga eri.",
        english: "If it is good, we will eat.",
      },
      illustrationKey: "If it rains, we will stay at home",
      audioKey: "if-it-rains-we-will-stay-at-home",
    },
    {
      sourceSentence: "My house is bigger than your house.",
      targetWords: ["Ụlọ", "m", "bụ", "nnukwu", "kar", "ụlọ", "gi"],
      distractors: ["na", "di", "ka", "nke"],
      igboRule: "'Ụlọ m' means 'my house.' 'Nnukwu' means 'big,' and 'kar' means 'more than.'",
      anotherExample: {
        igbo: "Okwu ya bụ mma kar okwu m.",
        english: "His word is better than mine.",
      },
      illustrationKey: "My house is bigger than your house",
      audioKey: "my-house-is-bigger-than-your-house",
    },
    {
      sourceSentence: "Shall we go see them?",
      targetWords: ["Ka", "anyi", "gaa", "hụ", "ha"],
      distractors: ["na", "ga", "nke", "bu"],
      igboRule: "'Ka anyi' means 'let us' or 'shall we.' 'Gaa' means 'go,' and 'hụ ha' means 'see them.'",
      anotherExample: {
        igbo: "Ka anyi rie nri.",
        english: "Shall we eat food?",
      },
      illustrationKey: "Shall we go see them",
      audioKey: "shall-we-go-see-them",
    },
    {
      sourceSentence: "The boy who is playing football is my friend.",
      targetWords: ["Nwata", "nwoke", "na", "egwu", "bọọlu", "bụ", "enyi", "m"],
      distractors: ["ya", "ha", "ka", "di"],
      igboRule: "This says the boy playing football is my friend. 'Enyi m' means 'my friend.'",
      anotherExample: {
        igbo: "Nwata na ịde akwụkwọ bụ ọmụmụ m.",
        english: "The child who writes is my student.",
      },
      illustrationKey: "The boy who is playing football is my friend",
      audioKey: "the-boy-who-is-playing-football-is-my-friend",
    },
    {
      sourceSentence: "They are playing football near the school.",
      targetWords: ["Ha", "na", "egwu", "bọọlu", "n'akụkụ", "ụlọ", "akwụkwọ"],
      distractors: ["m", "i", "anyi", "ka"],
      igboRule: "'Ha' means 'they.' 'Na egwu bọọlu' means 'are playing football,' and 'n'akụkụ' means 'near.'",
      anotherExample: {
        igbo: "Anyi na eje ibe.",
        english: "We are going to the farm.",
      },
      illustrationKey: "They are playing football near the school",
      audioKey: "they-are-playing-football-near-the-school",
    },
    {
      sourceSentence: "They walked a long distance this morning.",
      targetWords: ["Ha", "gagara", "anya", "ogologo", "n'ụtụtụ", "taa"],
      distractors: ["na", "bi", "ka", "nke"],
      igboRule: "This says they walked very far this morning. 'Taa' means 'today,' and 'n'ụtụtụ' means 'in the morning.'",
      anotherExample: {
        igbo: "O gagara anya.",
        english: "He/she walked a distance.",
      },
      illustrationKey: "They walked a long distance this morning",
      audioKey: "they-walked-a-long-distance-this-morning",
    },
    {
      sourceSentence: "We can go tomorrow.",
      targetWords: ["Anyi", "nwere", "ike", "iju", "echi"],
      distractors: ["ga", "na", "di", "ka"],
      igboRule: "'Nwere ike' means 'can.' 'Echi' means 'tomorrow.'",
      anotherExample: {
        igbo: "O nwere ike ibu ihe.",
        english: "He/she can carry the thing.",
      },
      illustrationKey: "We can go tomorrow",
      audioKey: "we-can-go-tomorrow",
    },
    {
      sourceSentence: "We cannot go home.",
      targetWords: ["Anyi", "agaghi", "uju", "ụlọ"],
      distractors: ["nwere", "na", "di", "cho"],
      igboRule: "'Agaghi' means 'will not' or 'cannot' here. 'Uju ụlọ' means 'go back home.'",
      anotherExample: {
        igbo: "Ha agaghi abụ nwoke.",
        english: "They will not become men.",
      },
      illustrationKey: "We cannot go home",
      audioKey: "we-cannot-go-home",
    },
  ];
}

function buildTensesBreakdownSeeds(): SentenceBreakdownSeed[] {
  return [
    // Present tense
    {
      sourceSentence: "I am eating food.",
      targetWords: ["Ana", "m", "eri", "nri"],
      distractors: ["Aga", "Gara", "Eriri", "ha"],
      igboRule: "'Ana m' starts a present tense sentence — it means 'I am doing.' 'Eri nri' means 'eating food.'",
      anotherExample: {
        igbo: "Ana ha eri nri.",
        english: "They are eating food.",
      },
      illustrationKey: "tenses-present-eat",
      audioKey: "i-am-eating-food",
    },
    {
      sourceSentence: "I am going home.",
      targetWords: ["Ana", "m", "aga", "ụlọ"],
      distractors: ["Aga", "Gara", "echi", "ha"],
      igboRule: "'Ana m' means 'I am doing now.' 'Aga ụlọ' means 'going home.'",
      anotherExample: {
        igbo: "Ana ha aga ụlọ.",
        english: "They are going home.",
      },
      illustrationKey: "tenses-present-go",
      audioKey: "i-am-going-home",
    },
    {
      sourceSentence: "I am learning Igbo.",
      targetWords: ["Ana", "m", "amụ", "Igbo"],
      distractors: ["Aga", "Mụtara", "nri", "ha"],
      igboRule: "'Ana m amụ' means 'I am learning right now.' Add what you are learning at the end.",
      anotherExample: {
        igbo: "Ana ha amụ Igbo.",
        english: "They are learning Igbo.",
      },
      illustrationKey: "tenses-present-learn",
      audioKey: "i-am-learning-igbo",
    },
    // Past tense
    {
      sourceSentence: "I ate food.",
      targetWords: ["Eriri", "m", "nri"],
      distractors: ["Ana", "Aga", "ụlọ", "ha"],
      igboRule: "In Igbo, past tense changes the start of the verb. 'Eri' (eat) becomes 'Eriri m' (I ate).",
      anotherExample: {
        igbo: "Eriri ha nri.",
        english: "They ate food.",
      },
      illustrationKey: "tenses-past-eat",
      audioKey: "i-ate-food",
    },
    {
      sourceSentence: "I went home.",
      targetWords: ["Gara", "m", "ụlọ"],
      distractors: ["Ana", "Aga", "nri", "ha"],
      igboRule: "'Ga' (go) becomes 'Gara m' in the past — 'I went.' The verb changes its ending.",
      anotherExample: {
        igbo: "Gara ha ụlọ.",
        english: "They went home.",
      },
      illustrationKey: "tenses-past-go",
      audioKey: "i-went-home",
    },
    {
      sourceSentence: "I learned Igbo.",
      targetWords: ["Mụtara", "m", "Igbo"],
      distractors: ["Ana", "Aga", "amụ", "ha"],
      igboRule: "'Amụ' (learn) becomes 'Mụtara m' in the past — meaning 'I learned.' Notice how the verb shifts.",
      anotherExample: {
        igbo: "Mụtara ha Igbo.",
        english: "They learned Igbo.",
      },
      illustrationKey: "tenses-past-learn",
      audioKey: "i-learned-igbo",
    },
    // Future tense
    {
      sourceSentence: "I will eat food.",
      targetWords: ["Aga", "m", "eri", "nri"],
      distractors: ["Ana", "Eriri", "Gara", "ha"],
      igboRule: "'Aga m' starts a future tense sentence — it means 'I will.' 'Eri nri' means 'eat food.'",
      anotherExample: {
        igbo: "Aga ha eri nri.",
        english: "They will eat food.",
      },
      illustrationKey: "tenses-future-eat",
      audioKey: "i-will-eat-food",
    },
    {
      sourceSentence: "I will go home.",
      targetWords: ["Aga", "m", "aga", "ụlọ"],
      distractors: ["Ana", "Eriri", "Gara", "ha"],
      igboRule: "'Aga m' means 'I will.' 'Aga ụlọ' means 'go home.' Together: I will go home.",
      anotherExample: {
        igbo: "Aga ha aga ụlọ.",
        english: "They will go home.",
      },
      illustrationKey: "tenses-future-go",
      audioKey: "i-will-go-home",
    },
    {
      sourceSentence: "I will learn Igbo.",
      targetWords: ["Aga", "m", "amụ", "Igbo"],
      distractors: ["Ana", "Eriri", "Mụtara", "ha"],
      igboRule: "'Aga m amụ' means 'I will learn.' Just say what you will learn after.",
      anotherExample: {
        igbo: "Aga ha amụ Igbo.",
        english: "They will learn Igbo.",
      },
      illustrationKey: "tenses-future-learn",
      audioKey: "i-will-learn-igbo",
    },
  ];
}

function buildAdjectivesBreakdownSeeds(): SentenceBreakdownSeed[] {
  return [
    // Noun + adjective (no verb)
    {
      sourceSentence: "Big house",
      targetWords: ["Ụlọ", "ukwu"],
      distractors: ["nta", "ọma", "dị", "ahụ"],
      igboRule: "In Igbo, adjectives come AFTER the noun. 'Ụlọ' means 'house,' 'ukwu' means 'big.'",
      anotherExample: {
        igbo: "Ụlọ nta",
        english: "Small house",
      },
      illustrationKey: "adjectives-big-house",
      audioKey: "big-house",
    },
    {
      sourceSentence: "Good person",
      targetWords: ["Onye", "ọma"],
      distractors: ["nwa", "ụlọ", "dị", "ukwu"],
      igboRule: "'Onye' means 'person.' 'Ọma' means 'good.' The adjective follows the noun.",
      anotherExample: {
        igbo: "Onye ọjọọ",
        english: "Bad person",
      },
      illustrationKey: "adjectives-good-person",
      audioKey: "good-person",
    },
    {
      sourceSentence: "Small child",
      targetWords: ["Nwa", "nta"],
      distractors: ["ụlọ", "onye", "dị", "ọma"],
      igboRule: "'Nwa' means 'child.' 'Nta' means 'small.' In Igbo: child small.",
      anotherExample: {
        igbo: "Nwa ukwu",
        english: "Big child",
      },
      illustrationKey: "adjectives-small-child",
      audioKey: "small-child",
    },
    {
      sourceSentence: "Beautiful woman",
      targetWords: ["Nwanyị", "mara", "mma"],
      distractors: ["nwa", "ụlọ", "dị", "ọma"],
      igboRule: "'Nwanyị' means 'woman.' 'Mara mma' means 'beautiful.' It uses two words together.",
      anotherExample: {
        igbo: "Nwoke mara mma",
        english: "Handsome man",
      },
      illustrationKey: "adjectives-beautiful-woman",
      audioKey: "beautiful-woman",
    },
    // Noun + dị + adjective
    {
      sourceSentence: "The house is big.",
      targetWords: ["Ụlọ", "ahụ", "dị", "ukwu"],
      distractors: ["nwa", "ọma", "nri", "oyi"],
      igboRule: "To say something IS a certain way, use: Noun + ahụ + dị + adjective. 'Dị' links noun and adjective.",
      anotherExample: {
        igbo: "Ụlọ ahụ dị nta.",
        english: "The house is small.",
      },
      illustrationKey: "adjectives-house-is-big",
      audioKey: "the-house-is-big",
    },
    {
      sourceSentence: "The food is good.",
      targetWords: ["Nri", "ahụ", "dị", "mma"],
      distractors: ["ụlọ", "ukwu", "onye", "oyi"],
      igboRule: "'Nri' means 'food.' 'Dị mma' means 'is good.' Use 'ahụ' to say 'the' in Igbo.",
      anotherExample: {
        igbo: "Nri ahụ dị ọjọọ.",
        english: "The food is bad.",
      },
      illustrationKey: "adjectives-food-is-good",
      audioKey: "the-food-is-good",
    },
    {
      sourceSentence: "The water is cold.",
      targetWords: ["Mmiri", "ahụ", "dị", "oyi"],
      distractors: ["nri", "ụlọ", "ọkụ", "mma"],
      igboRule: "'Mmiri' means 'water.' 'Oyi' means 'cold.' Igbo pairs noun + ahụ + dị + adjective.",
      anotherExample: {
        igbo: "Mmiri ahụ dị ọkụ.",
        english: "The water is hot.",
      },
      illustrationKey: "adjectives-water-is-cold",
      audioKey: "the-water-is-cold",
    },
    // ezigbo (very)
    {
      sourceSentence: "The food is very good.",
      targetWords: ["Nri", "ahụ", "dị", "ezigbo", "mma"],
      distractors: ["ụlọ", "oyi", "ukwu", "onye"],
      igboRule: "To say 'very,' add 'ezigbo' before the adjective. 'Ezigbo mma' means 'very good.'",
      anotherExample: {
        igbo: "Ụlọ ahụ dị ezigbo ukwu.",
        english: "The house is very big.",
      },
      illustrationKey: "adjectives-food-very-good",
      audioKey: "the-food-is-very-good",
    },
    // dị + adjective on self
    {
      sourceSentence: "The child is strong.",
      targetWords: ["Nwa", "ahụ", "dị", "ike"],
      distractors: ["nri", "ụlọ", "mma", "oyi"],
      igboRule: "'Ike' means 'strong.' 'Nwa ahụ dị ike' — the child is strong. Same dị pattern.",
      anotherExample: {
        igbo: "Adị m ike.",
        english: "I am strong.",
      },
      illustrationKey: "adjectives-child-strong",
      audioKey: "the-child-is-strong",
    },
  ];
}

function buildTimeDatesBreakdownSeeds(): SentenceBreakdownSeed[] {
  return [
    {
      sourceSentence: "I am learning Igbo today.",
      targetWords: ["Ana", "m", "amụ", "Igbo", "taa"],
      distractors: ["Aga", "echi", "ụnyaahụ", "izu"],
      igboRule: "'Taa' means 'today.' Put time words at the end of the sentence in Igbo.",
      anotherExample: {
        igbo: "Ana m arụ ọrụ taa.",
        english: "I am working today.",
      },
      illustrationKey: "time-today",
      audioKey: "learning-igbo-today",
    },
    {
      sourceSentence: "I went to the market yesterday.",
      targetWords: ["Gara", "m", "ahịa", "ụnyaahụ"],
      distractors: ["Ana", "Aga", "taa", "echi"],
      igboRule: "'Ụnyaahụ' means 'yesterday.' Past tense verbs like 'Gara m' tell you the action is done.",
      anotherExample: {
        igbo: "Gara m ụlọ ụnyaahụ.",
        english: "I went home yesterday.",
      },
      illustrationKey: "time-yesterday",
      audioKey: "went-to-market-yesterday",
    },
    {
      sourceSentence: "I will come tomorrow.",
      targetWords: ["Aga", "m", "abịa", "echi"],
      distractors: ["Ana", "taa", "ụnyaahụ", "amụ"],
      igboRule: "'Echi' means 'tomorrow.' Use 'Aga m' to talk about the future.",
      anotherExample: {
        igbo: "Aga m aga ụlọ echi.",
        english: "I will go home tomorrow.",
      },
      illustrationKey: "time-tomorrow",
      audioKey: "will-go-tomorrow",
    },
    {
      sourceSentence: "I will come at 3 o'clock.",
      targetWords: ["Aga", "m", "abịa", "na", "elekere", "atọ"],
      distractors: ["taa", "ụnyaahụ", "ise", "abụọ"],
      igboRule: "'Elekere' means 'clock' or 'o'clock.' Say 'na elekere' + the number for the time.",
      anotherExample: {
        igbo: "Aga m abịa na elekere ise.",
        english: "I will come at 5 o'clock.",
      },
      illustrationKey: "time-oclock",
      audioKey: "will-come-at-3",
    },
    {
      sourceSentence: "I work in the morning.",
      targetWords: ["Ana", "m", "arụ", "ọrụ", "n'ụtụtụ"],
      distractors: ["mgbede", "abalị", "echi", "Aga"],
      igboRule: "'N'ụtụtụ' means 'in the morning.' Other parts of day: ehihie (afternoon), mgbede (evening), abalị (night).",
      anotherExample: {
        igbo: "Ana m eri nri n'ehihie.",
        english: "I eat in the afternoon.",
      },
      illustrationKey: "time-morning",
      audioKey: "work-in-morning",
    },
    {
      sourceSentence: "We will meet in the evening.",
      targetWords: ["Anyi", "ga-ezukọ", "na", "mgbede"],
      distractors: ["ụtụtụ", "abalị", "taa", "m"],
      igboRule: "'Mgbede' means 'evening.' 'Ga-ezukọ' means 'will meet.'",
      anotherExample: {
        igbo: "Ana m ehi ụra n'abalị.",
        english: "I sleep at night.",
      },
      illustrationKey: "time-evening",
      audioKey: "meet-in-evening",
    },
    {
      sourceSentence: "I am learning Igbo this week.",
      targetWords: ["Ana", "m", "amụ", "Igbo", "izu", "a"],
      distractors: ["ọnwa", "afọ", "echi", "gara"],
      igboRule: "'Izu a' means 'this week.' Add 'a' after izu/ọnwa/afọ to say 'this.'",
      anotherExample: {
        igbo: "Ana m arụsi ọrụ ike ọnwa a.",
        english: "I am working hard this month.",
      },
      illustrationKey: "time-this-week",
      audioKey: "learning-igbo-this-week",
    },
    {
      sourceSentence: "I went to the market last week.",
      targetWords: ["Gara", "m", "ahịa", "izu", "gara", "aga"],
      distractors: ["Ana", "Aga", "na-abịa", "taa"],
      igboRule: "'Izu gara aga' means 'last week.' Use 'gara aga' after any time word for 'last.'",
      anotherExample: {
        igbo: "Mụtara m ọtụtụ okwu ọhụrụ ọnwa gara aga.",
        english: "I learned many new words last month.",
      },
      illustrationKey: "time-last-week",
      audioKey: "went-market-last-week",
    },
    {
      sourceSentence: "I will start a new job next week.",
      targetWords: ["Aga", "m", "amalite", "ọrụ", "ọhụrụ", "izu", "na-abịa"],
      distractors: ["Ana", "gara", "aga", "taa"],
      igboRule: "'Izu na-abịa' means 'next week.' Use 'na-abịa' after any time word for 'next.'",
      anotherExample: {
        igbo: "Aga m eleta ezinụlọ m ọnwa na-abịa.",
        english: "I will visit my family next month.",
      },
      illustrationKey: "time-next-week",
      audioKey: "start-new-job-next-week",
    },
  ];
}

function buildTravelCultureBreakdownSeeds(): SentenceBreakdownSeed[] {
  return [
    {
      sourceSentence: "I am travelling.",
      targetWords: ["Ana", "m", "eje", "njem"],
      distractors: ["Aga", "obodo", "ahịa", "ụzọ"],
      igboRule: "'Njem' means 'journey' or 'travel.' 'Ana m eje njem' — I am going on a journey.",
      anotherExample: {
        igbo: "Aga m eje njem echi.",
        english: "I will travel tomorrow.",
      },
      illustrationKey: "travel-journey",
      audioKey: "i-am-travelling",
    },
    {
      sourceSentence: "Where is the market?",
      targetWords: ["Ebee", "ka", "ahịa", "dị"],
      distractors: ["ụzọ", "obodo", "ụlọ", "njem"],
      igboRule: "'Ebee ka... dị?' means 'Where is...?' Use this pattern to ask for directions to any place.",
      anotherExample: {
        igbo: "Ebee ka ụlọ nkwari akụ dị?",
        english: "Where is the hotel?",
      },
      illustrationKey: "travel-market",
      audioKey: "where-is-the-market",
    },
    {
      sourceSentence: "I am going to town.",
      targetWords: ["Ana", "m", "aga", "obodo"],
      distractors: ["Aga", "ahịa", "echi", "ụlọ"],
      igboRule: "'Obodo' means 'town' or 'community.' 'Ana m aga obodo' — I am going to town (present tense).",
      anotherExample: {
        igbo: "Aga m Lagos echi.",
        english: "I will go to Lagos tomorrow.",
      },
      illustrationKey: "travel-going",
      audioKey: "i-am-going-to-town",
    },
    {
      sourceSentence: "We will meet at the village square.",
      targetWords: ["Anyi", "ga-ezukọ", "n'ama"],
      distractors: ["obi", "ahịa", "ụlọ", "taa"],
      igboRule: "'Ama' means 'village square' — the central gathering place of Igbo communities.",
      anotherExample: {
        igbo: "Anyi ga-ezukọ n'obi.",
        english: "We will meet at the family compound.",
      },
      illustrationKey: "travel-village-square",
      audioKey: "we-will-meet-at-village-square",
    },
    {
      sourceSentence: "My father is at the family compound.",
      targetWords: ["Nna", "m", "nọ", "n'obi"],
      distractors: ["ama", "ahịa", "ụlọ", "ha"],
      igboRule: "'Obi' is the family compound — the traditional home of a family's lineage in Igbo culture.",
      anotherExample: {
        igbo: "Nne m nọ n'ụlọ.",
        english: "My mother is at home.",
      },
      illustrationKey: "travel-family-home",
      audioKey: "my-father-is-at-family-compound",
    },
    {
      sourceSentence: "I will visit my sibling.",
      targetWords: ["Aga", "m", "eleta", "nwanne", "m"],
      distractors: ["obi", "ahịa", "echi", "ama"],
      igboRule: "'Nwanne m' means 'my sibling' or 'my relative.' 'Eleta' means 'to visit.'",
      anotherExample: {
        igbo: "Aga m eleta ezinụlọ m.",
        english: "I will visit my family.",
      },
      illustrationKey: "travel-sibling",
      audioKey: "i-will-visit-my-sibling",
    },
    {
      sourceSentence: "The celebration was beautiful.",
      targetWords: ["Emume", "ahụ", "mara", "mma"],
      distractors: ["nri", "egwu", "ọma", "ụlọ"],
      igboRule: "'Emume' means 'celebration' or 'event.' Celebrations are central to Igbo communal life.",
      anotherExample: {
        igbo: "Emume ahụ dị mma.",
        english: "The celebration was good.",
      },
      illustrationKey: "travel-celebration",
      audioKey: "the-celebration-was-beautiful",
    },
    {
      sourceSentence: "I will visit my family.",
      targetWords: ["Aga", "m", "eleta", "ezinụlọ", "m"],
      distractors: ["obi", "nwanne", "ahịa", "taa"],
      igboRule: "'Ezinụlọ' means 'family.' 'Eleta' means 'visit.' Family visits are a key part of Igbo culture.",
      anotherExample: {
        igbo: "Obi dị m ụtọ ịhụ gị.",
        english: "I am happy to see you.",
      },
      illustrationKey: "travel-visit-family",
      audioKey: "i-will-visit-my-family",
    },
    {
      sourceSentence: "I am going to my father's hometown.",
      targetWords: ["Ana", "m", "aga", "obodo", "nna", "m"],
      distractors: ["Aga", "eleta", "echi", "ama"],
      igboRule: "'Obodo nna m' means 'my father's hometown.' Every Igbo person has a village they belong to.",
      anotherExample: {
        igbo: "Maka emume ezinụlọ.",
        english: "For a family celebration.",
      },
      illustrationKey: "travel-hometown",
      audioKey: "i-am-going-to-my-fathers-hometown",
    },
  ];
}

function buildOpinionsDebateBreakdownSeeds(): SentenceBreakdownSeed[] {
  return [
    {
      sourceSentence: "I think it is good.",
      targetWords: ["Echere", "m", "na", "ọ", "dị", "mma"],
      distractors: ["Ekwenyere", "n'ihi", "Mba", "ụgha"],
      igboRule: "'Echere m na...' means 'I think that...' Use this pattern to share your opinion about anything.",
      anotherExample: {
        igbo: "Echere m na nke ahụ bụ ezi echiche.",
        english: "I think that is a good idea.",
      },
      illustrationKey: "opinions-think-good",
      audioKey: "i-think-it-is-good",
    },
    {
      sourceSentence: "In my opinion, Igbo is easy.",
      targetWords: ["N'echiche", "m,", "Igbo", "dị", "mfe"],
      distractors: ["Echere", "siri", "ike", "mma"],
      igboRule: "'N'echiche m' means 'In my opinion.' It is a softer, more formal way to share your view.",
      anotherExample: {
        igbo: "N'echiche m, nke ahụ adịghị mma.",
        english: "In my opinion, that is not good.",
      },
      illustrationKey: "opinions-igbo-easy",
      audioKey: "in-my-opinion-igbo-easy",
    },
    {
      sourceSentence: "I agree with you.",
      targetWords: ["Ekwenyere", "m", "gị"],
      distractors: ["mghị", "Mba", "Echere", "n'ihi"],
      igboRule: "'Ekwenyere m gị' means 'I agree with you.' Drop 'gị' to say 'I agree' on its own.",
      anotherExample: {
        igbo: "Ee, nke ahụ bụ eziokwu.",
        english: "Yes, that is true.",
      },
      illustrationKey: "opinions-agree",
      audioKey: "i-agree-with-you",
    },
    {
      sourceSentence: "I disagree.",
      targetWords: ["Ekwenyere", "mghị"],
      distractors: ["m", "gị", "Echere", "Mba"],
      igboRule: "'Ekwenyere mghị' means 'I disagree.' The suffix '-ghị' negates a verb in Igbo.",
      anotherExample: {
        igbo: "Mba, echere m na ọ bụghị eziokwu.",
        english: "No, I think it is not true.",
      },
      illustrationKey: "opinions-disagree",
      audioKey: "i-disagree",
    },
    {
      sourceSentence: "What do you think?",
      targetWords: ["Gịnị", "ka", "ị", "chere?"],
      distractors: ["Echere", "m", "banyere", "mma"],
      igboRule: "'Gịnị ka ị chere?' means 'What do you think?' Use it to invite someone's opinion in any discussion.",
      anotherExample: {
        igbo: "Gịnị ka ị chere banyere fim ahụ?",
        english: "What do you think about that movie?",
      },
      illustrationKey: "opinions-what-think",
      audioKey: "what-do-you-think",
    },
    {
      sourceSentence: "I think it is good because it is useful.",
      targetWords: ["Echere", "m", "na", "ọ", "dị", "mma", "n'ihi", "na", "ọ", "bara", "uru"],
      distractors: ["siri", "ike", "adịghị", "Mba"],
      igboRule: "'N'ihi na...' means 'because...' Attach it to give a reason for your opinion.",
      anotherExample: {
        igbo: "Ekwenyere m gị n'ihi na nke ahụ bụ eziokwu.",
        english: "I agree with you because that is true.",
      },
      illustrationKey: "opinions-because-useful",
      audioKey: "i-think-because-useful",
    },
    {
      sourceSentence: "That is true.",
      targetWords: ["Nke", "ahụ", "bụ", "eziokwu"],
      distractors: ["ụgha", "mma", "Mba", "dị"],
      igboRule: "'Eziokwu' means 'truth.' 'Nke ahụ bụ eziokwu' — That is the truth.",
      anotherExample: {
        igbo: "Ee, nke ahụ bụ eziokwu.",
        english: "Yes, that is true.",
      },
      illustrationKey: "opinions-that-true",
      audioKey: "that-is-true",
    },
    {
      sourceSentence: "That is false.",
      targetWords: ["Nke", "ahụ", "bụ", "ụgha"],
      distractors: ["eziokwu", "mma", "dị", "na"],
      igboRule: "'Ụgha' means 'lie' or 'falsehood.' The opposite of 'eziokwu' (truth).",
      anotherExample: {
        igbo: "Nke ahụ abụghị eziokwu.",
        english: "That is not true.",
      },
      illustrationKey: "opinions-that-false",
      audioKey: "that-is-false",
    },
    {
      sourceSentence: "I think we should go.",
      targetWords: ["Echere", "m", "na", "anyị", "kwesịrị", "ịga"],
      distractors: ["Ekwenyere", "n'ihi", "mfe", "mma"],
      igboRule: "'Kwesịrị' means 'should' or 'ought to.' 'Anyị kwesịrị ịga' — We should go.",
      anotherExample: {
        igbo: "Anyị kwesịrị ịga ụlọ.",
        english: "We should go home.",
      },
      illustrationKey: "opinions-we-should-go",
      audioKey: "i-think-we-should-go",
    },
  ];
}

function buildShoppingBargainingBreakdownSeeds(): SentenceBreakdownSeed[] {
  return [
    {
      sourceSentence: "How much is it?",
      targetWords: ["Ego", "ole", "ka", "ọ", "bụ?"],
      distractors: ["Achọrọ", "m", "dị", "nri"],
      igboRule: "'Ego ole ka ọ bụ?' is the universal question for 'How much is it?'",
      anotherExample: {
        igbo: "Ego ole ka mango a bụ?",
        english: "How much is this mango?",
      },
      illustrationKey: "shopping-how-much",
      audioKey: "how-much-is-it",
    },
    {
      sourceSentence: "I want to shop.",
      targetWords: ["Achọrọ", "m", "ịzụ", "ahịa"],
      distractors: ["Ego", "ole", "bụ", "nri"],
      igboRule: "'Achọrọ m' means 'I want.' 'Ịzụ ahịa' is the verb phrase 'to shop' or 'to buy goods.'",
      anotherExample: {
        igbo: "Achọrọ m mango abụọ.",
        english: "I want two mangoes.",
      },
      illustrationKey: "shopping-want",
      audioKey: "i-want-to-shop",
    },
    {
      sourceSentence: "I am buying a book.",
      targetWords: ["Ana", "m", "azụ", "akwụkwọ"],
      distractors: ["Achọrọ", "bụ", "dị", "ego"],
      igboRule: "'Ana m azụ' represents the present continuous tense 'I am buying.'",
      anotherExample: {
        igbo: "Aga m azụ nri.",
        english: "I will buy food.",
      },
      illustrationKey: "shopping-buying",
      audioKey: "i-am-buying-a-book",
    },
    {
      sourceSentence: "It is expensive.",
      targetWords: ["Ọ", "dị", "oke", "ọnụ"],
      distractors: ["ala", "mfe", "Biko", "ego"],
      igboRule: "'Ọ dị oke ọnụ' literally translates to 'It is of high mouth/price,' meaning 'expensive.'",
      anotherExample: {
        igbo: "Ọ dị ọnụ ala.",
        english: "It is cheap.",
      },
      illustrationKey: "shopping-expensive",
      audioKey: "it-is-expensive",
    },
    {
      sourceSentence: "Please reduce the price.",
      targetWords: ["Biko,", "belata", "ọnụ", "ahịa"],
      distractors: ["dị", "oke", "Achọrọ", "m"],
      igboRule: "'Belata' is the imperative 'reduce.' 'Biko, belata ọnụ ahịa' is how you barging is Igbo markets.",
      anotherExample: {
        igbo: "Ọ dị oke ọnụ. Belata ya ntakịrị.",
        english: "It is expensive. Reduce it a little.",
      },
      illustrationKey: "shopping-bargaining",
      audioKey: "please-reduce-the-price",
    },
    {
      sourceSentence: "I want three mangoes.",
      targetWords: ["Achọrọ", "m", "mango", "atọ"],
      distractors: ["abụọ", "nri", "bụ", "ole"],
      igboRule: "In Igbo, the adjective or number usually follows the noun it describes ('mango atọ' = three mangoes).",
      anotherExample: {
        igbo: "Achọrọ m uwe ọhụrụ.",
        english: "I want a new cloth.",
      },
      illustrationKey: "shopping-numbers",
      audioKey: "i-want-three-mangoes",
    },
    {
      sourceSentence: "I have money.",
      targetWords: ["Enwere", "m", "ego"],
      distractors: ["adịghị", "bụ", "akwụkwọ", "nri"],
      igboRule: "'Enwere m' means 'I have.' 'Ego' means 'money.'",
      anotherExample: {
        igbo: "Ego adịghị m ugbu a.",
        english: "I don't have money now.",
      },
      illustrationKey: "shopping-paying",
      audioKey: "i-have-money",
    },
    {
      sourceSentence: "Give me two bananas.",
      targetWords: ["Nye", "m", "banana", "abụọ"],
      distractors: ["atọ", "achọrọ", "bụ", "ala"],
      igboRule: "'Nye m' is the command 'Give me.' Always follow it with the noun then the count.",
      anotherExample: {
        igbo: "Nye m mango abụọ.",
        english: "Give me two mangoes.",
      },
      illustrationKey: "shopping-bananas",
      audioKey: "give-me-two-bananas",
    },
    {
      sourceSentence: "I bought shoes.",
      targetWords: ["Azụrụ", "m", "akpụkpọ", "ụkwụ"],
      distractors: ["Ana", "aga", "uwe", "nri"],
      igboRule: "'Azụrụ m' is the past simple 'I bought.' 'Akpụkpọ ụkwụ' literally means 'skin of feet' (shoes).",
      anotherExample: {
        igbo: "Azụrụ m uwe.",
        english: "I bought clothes.",
      },
      illustrationKey: "shopping-bought-shoes",
      audioKey: "i-bought-shoes",
    },
  ];
}

function buildProverbsIdiomsBreakdownSeeds(): SentenceBreakdownSeed[] {
  return [
    {
      sourceSentence: "Proverbs are the palm oil used to eat words.",
      targetWords: ["Ilu", "bụ", "mmanụ", "eji", "eri", "okwu"],
      distractors: ["dike", "ogụ", "eze", "osisi"],
      igboRule: "'Ilu' means 'proverb.' 'Mmanụ' means 'oil' (specifically palm oil here). This teaches that proverbs enrich conversation.",
      anotherExample: {
        igbo: "Ilu bụ mmanụ eji eri okwu taa.",
        english: "Proverbs are the palm oil with which words are eaten today.",
      },
      illustrationKey: "proverbs-oil-words",
      audioKey: "proverbs-oil-words",
    },
    {
      sourceSentence: "Let the kite perch, let the eagle perch.",
      targetWords: ["Egbe", "bere,", "ugo", "bere"],
      distractors: ["dike", "onye", "eze", "osisi"],
      igboRule: "'Egbe' is kite, 'ugo' is eagle. 'Bere' means perch or settle. This advocates for tolerance and equal opportunity.",
      anotherExample: {
        igbo: "Biko, egbe bere ugo bere.",
        english: "Please, let the kite perch and let the eagle perch.",
      },
      illustrationKey: "proverbs-kite-eagle",
      audioKey: "proverbs-kite-eagle",
    },
    {
      sourceSentence: "A child who washes his hands eats with elders.",
      targetWords: ["Nwata", "kwocha", "aka,", "ọ", "soro", "ndị", "okenye", "rie", "nri"],
      distractors: ["eze", "dike", "osisi", "ogụ"],
      igboRule: "'Kwocha aka' is washing hands. 'Okenye' is elder. Good manners and achievement elevate a youth.",
      anotherExample: {
        igbo: "Ọ na-eso ndị okenye.",
        english: "He/she joins the elders.",
      },
      illustrationKey: "proverbs-wash-hands",
      audioKey: "proverbs-wash-hands",
    },
    {
      sourceSentence: "The right hand washes the left, and the left washes the right.",
      targetWords: ["Aka", "nri", "kwoo", "aka", "ekpe,", "aka", "ekpe", "akụọ", "aka", "nri"],
      distractors: ["dike", "eze", "ọhịa", "osisi"],
      igboRule: "'Aka nri' is right hand. 'Aka ekpe' is left hand. Expresses Mutual aid and reciprocal support.",
      anotherExample: {
        igbo: "Aka nri na-esiri m ike.",
        english: "My right hand is strong.",
      },
      illustrationKey: "proverbs-hands-cooperate",
      audioKey: "proverbs-hands-cooperate",
    },
    {
      sourceSentence: "The person who asks questions never loses the way.",
      targetWords: ["Onye", "ajụjụ", "anaghị", "efu", "ụzọ"],
      distractors: ["dike", "eze", "mmanụ", "ilu"],
      igboRule: "'Ajụjụ' is question/asking. 'Efu ụzọ' is losing path. Encourages seeking wisdom and guidance.",
      anotherExample: {
        igbo: "Onye ajụjụ na-achọ amamihe.",
        english: "The person who asks questions seeks wisdom.",
      },
      illustrationKey: "proverbs-askquestions",
      audioKey: "proverbs-askquestions",
    },
    {
      sourceSentence: "One tree does not make a forest.",
      targetWords: ["Otu", "osisi", "anaghị", "eme", "ọhịa"],
      distractors: ["dike", "eze", "bọọlu", "nri"],
      igboRule: "'Otu osisi' is one tree. 'Ọhịa' is forest. Community and teamwork are essential for greatness.",
      anotherExample: {
        igbo: "Anyị bụ otu osisi n'ọhịa.",
        english: "We are one tree in a forest.",
      },
      illustrationKey: "proverbs-one-tree",
      audioKey: "proverbs-one-tree",
    },
    {
      sourceSentence: "Whoever serves the king should receive benefit from the king.",
      targetWords: ["Onye", "fee", "eze,", "eze", "eruo", "ya"],
      distractors: ["dike", "mmanụ", "osisi", "aka"],
      igboRule: "'Fee eze' is serving/knowing the king. Assures that dedication and service lead to reward and status.",
      anotherExample: {
        igbo: "Onye fee eze ga-enwe anụrị.",
        english: "Whoever serves the king will have joy.",
      },
      illustrationKey: "proverbs-serve-king",
      audioKey: "proverbs-serve-king",
    },
    {
      sourceSentence: "A hero is known in battle.",
      targetWords: ["A", "na-amata", "dike", "n'ogu"],
      distractors: ["eze", "ilu", "osisi", "nri"],
      igboRule: "'Dike' is hero/warrior. 'Ogu' is fight/battle. True strength is proven during adversity.",
      anotherExample: {
        igbo: "Anyị na-amata dike taa.",
        english: "We recognize a hero today.",
      },
      illustrationKey: "proverbs-hero-known",
      audioKey: "proverbs-hero-known",
    },
    {
      sourceSentence: "A good person is known by their actions.",
      targetWords: ["E", "jiri", "mara", "onye", "ọma", "bụ", "omume", "ya"],
      distractors: ["eze", "dike", "osisi", "aka"],
      igboRule: "'Omume ya' is his/her behavior or actions. Virtue is shown through real lifestyle choice.",
      anotherExample: {
        igbo: "Omume ya mara mma.",
        english: "His/her behavior is beautiful.",
      },
      illustrationKey: "proverbs-actions-good",
      audioKey: "proverbs-actions-good",
    },
  ];
}

function buildStoryQuestions(lessonId: string): Question[] {
  if (lessonId === "greetings") {
    return buildBalancedStoryQuestionSet(GREETINGS_STORY_DIALOGUE);
  }

  if (lessonId === "everyday-verbs") {
    return buildBalancedStoryQuestionSet(EVERYDAY_VERBS_STORY_DIALOGUE);
  }

  if (lessonId === "asking-questions") {
    return buildBalancedStoryQuestionSet(ASKING_QUESTIONS_STORY_DIALOGUE);
  }

  if (lessonId === "celebrations") {
    return buildBalancedStoryQuestionSet(CELEBRATIONS_STORY_DIALOGUE);
  }

  if (lessonId === "elders") {
    return buildBalancedStoryQuestionSet(ELDERS_STORY_DIALOGUE);
  }

  if (lessonId === "emotions") {
    return buildBalancedStoryQuestionSet(EMOTIONS_STORY_DIALOGUE);
  }

  if (lessonId === "food-cooking") {
    return buildBalancedStoryQuestionSet(FOOD_COOKING_STORY_DIALOGUE);
  }

  if (lessonId === "girl-and-skull") {
    return buildBalancedStoryQuestionSet(GIRL_AND_SKULL_STORY_DIALOGUE);
  }

  if (lessonId === "family-people") {
    return buildBalancedStoryQuestionSet(FAMILY_PEOPLE_STORY_DIALOGUE);
  }

  if (lessonId === "health") {
    return buildBalancedStoryQuestionSet(HEALTH_STORY_DIALOGUE);
  }

  if (lessonId === "household-objects") {
    return buildBalancedStoryQuestionSet(HOUSEHOLD_OBJECTS_STORY_DIALOGUE);
  }

  if (lessonId === "mosquito-and-ear") {
    return buildBalancedStoryQuestionSet(MOSQUITO_AND_EAR_STORY_DIALOGUE);
  }

  if (lessonId === "pointing-things-out") {
    return buildBalancedStoryQuestionSet(POINTING_THINGS_OUT_STORY_DIALOGUE);
  }

  if (lessonId === "numbers-money") {
    return buildBalancedStoryQuestionSet(NUMBERS_MONEY_STORY_DIALOGUE);
  }

  if (lessonId === "school-work") {
    return buildBalancedStoryQuestionSet(SCHOOL_WORK_STORY_DIALOGUE);
  }

  if (lessonId === "tortoise-and-its-shell") {
    return buildBalancedStoryQuestionSet(TORTOISE_AND_ITS_SHELL_STORY_DIALOGUE);
  }

  if (lessonId === "tortoise-and-dove") {
    return buildBalancedStoryQuestionSet(TORTOISE_AND_DOVE_STORY_DIALOGUE);
  }

  if (lessonId === "transportation") {
    return buildBalancedStoryQuestionSet(TRANSPORTATION_STORY_DIALOGUE);
  }

  if (lessonId === "weather-nature") {
    return buildBalancedStoryQuestionSet(WEATHER_NATURE_STORY_DIALOGUE);
  }

  return [];
}

function buildBalancedStoryQuestionSet(entries: StoryDialogueEntry[]): Question[] {
  if (entries.length === 0) {
    return [];
  }

  const truthAssignments = buildBalancedTruthAssignments(entries.length);

  return entries.map((entry, index) => {
    const shouldBeTrue = truthAssignments[index];

    const statement = shouldBeTrue
      ? entry.statement
      :
      entry.falseStatement?.trim() ||
      buildMismatchedStoryStatement(
        entries,
        index,
        formatStorySpeakerLabel(entry.speaker)
      );

    return {
      prompt: "Story mode",
      answer: shouldBeTrue ? "True" : "False",
      visualKey: "",
      audioKey: entry.audioKey,
      storyMode: {
        speaker: entry.speaker,
        igboText: entry.igboText,
        englishText: entry.englishText,
        statement,
        correctAnswer: shouldBeTrue,
        dadSvgPath: entry.dadSvgPath,
        daughterSvgPath: entry.daughterSvgPath,
      },
    };
  });
}

function formatStorySpeakerLabel(speaker: StorySpeaker): string {
  if (speaker === "dad") {
    return "Dad";
  }

  if (speaker === "granddaughter") {
    return "Granddaughter";
  }

  if (speaker === "dove") {
    return "Dove";
  }

  return "Daughter";
}

function buildBalancedTruthAssignments(count: number): boolean[] {
  const half = Math.floor(count / 2);
  const hasExtra = count % 2 === 1;
  const useExtraTrue = hasExtra ? Math.random() < 0.5 : false;
  const trueCount = half + (useExtraTrue ? 1 : 0);
  const falseCount = count - trueCount;

  return shuffleArray([
    ...Array(trueCount).fill(true),
    ...Array(falseCount).fill(false),
  ]);
}

function buildMismatchedStoryStatement(
  entries: StoryDialogueEntry[],
  sourceIndex: number,
  speakerLabel: string
): string {
  if (entries.length <= 1) {
    return `True or false: ${speakerLabel} says, "${entries[sourceIndex]?.englishText ?? ""}"`;
  }

  const mismatchPool = entries.filter((_, index) => index !== sourceIndex);
  const randomMismatch =
    mismatchPool[Math.floor(Math.random() * mismatchPool.length)] ?? entries[sourceIndex];

  return `True or false: ${speakerLabel} says, "${randomMismatch.englishText}"`;
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

function buildSentenceBreakdownQuestionSet(
  sentenceSeeds: SentenceBreakdownSeed[]
): Question[] {
  return sentenceSeeds.map((seed) => {
    const sentenceAnswer = seed.targetWords.join(" ");
    const anotherExampleAudioKey = seed.audioKey
      ? `${seed.audioKey}-example`
      : undefined;

    return {
      prompt: "Sentence breakdown",
      answer: sentenceAnswer,
      visualKey: seed.illustrationKey,
      audioKey: seed.audioKey,
      sentenceBreakdown: {
        sourceSentence: seed.sourceSentence,
        targetWords: seed.targetWords,
        bankWords: shuffleArray([
          ...seed.targetWords,
          ...seed.distractors,
        ]),
        wordGlosses: seed.audioKey
          ? SENTENCE_BREAKDOWN_WORD_GLOSSES[seed.audioKey]
          : undefined,
        igboRule: seed.igboRule,
        anotherExample: seed.anotherExample,
        anotherExampleAudioKey,
        illustrationKey: seed.illustrationKey,
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
    (item) => !item.sentenceBuilder && !item.sentenceBreakdown && !item.storyMode
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

function resolveAudioKey(
  audioMap: Record<string, number>,
  candidate: string
): string | undefined {
  if (audioMap[candidate]) {
    return candidate;
  }

  const normalizedCandidate = normalizeAnswer(candidate);
  const matched = Object.keys(audioMap).find(
    (key) => normalizeAnswer(key) === normalizedCandidate
  );

  return matched;
}

function toToneMarkedText(lessonId: string, candidate: string): string {
  const translations = LESSON_TRANSLATIONS[lessonId];
  if (!translations) {
    return candidate;
  }

  if (translations[candidate]) {
    return candidate;
  }

  const normalizedCandidate = normalizeAnswer(candidate);
  const matched = Object.keys(translations).find(
    (key) => normalizeAnswer(key) === normalizedCandidate
  );

  return matched ?? candidate;
}

function resolveVisualKey(prompt: string, answer: string): string {
  const byAnswer = VISUAL_KEY_OVERRIDES_BY_IGBO[answer];
  if (byAnswer) {
    return byAnswer;
  }

  const byNormalizedAnswer =
    NORMALIZED_VISUAL_KEY_OVERRIDES_BY_IGBO[normalizeAnswer(answer)];
  if (byNormalizedAnswer) {
    return byNormalizedAnswer;
  }

  return DEFAULT_VISUAL_KEY_BY_ENGLISH_PROMPT[prompt] ?? "";
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
  return formatDateKey(new Date());
}

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateKey(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const [yearRaw, monthRaw, dayRaw] = value.split("-");
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);
  const parsed = new Date(year, month - 1, day);

  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  parsed.setHours(0, 0, 0, 0);
  return parsed;
}

function normalizeCompletedDayKeys(values: string[]): string[] {
  return Array.from(new Set(values.filter((value) => parseDateKey(value) != null)))
    .sort();
}

function calculateStreakCount(completedDayKeys: string[], todayKey: string): number {
  const completedKeySet = new Set(normalizeCompletedDayKeys(completedDayKeys));
  if (completedKeySet.size === 0) {
    return 0;
  }

  const todayDate = parseDateKey(todayKey);
  if (!todayDate) {
    return 0;
  }

  let cursor = new Date(todayDate);
  let cursorKey = formatDateKey(cursor);

  if (!completedKeySet.has(cursorKey)) {
    cursor.setDate(cursor.getDate() - 1);
    cursorKey = formatDateKey(cursor);

    if (!completedKeySet.has(cursorKey)) {
      return 0;
    }
  }

  let streak = 0;

  while (completedKeySet.has(cursorKey)) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
    cursorKey = formatDateKey(cursor);
  }

  return streak;
}
