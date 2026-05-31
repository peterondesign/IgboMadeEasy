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
import { ELDERS_AUDIO, ELDERS_ENTRIES } from "./src/data/eldersAudio";
import { EMOTIONS_AUDIO, EMOTIONS_ENTRIES } from "./src/data/emotionsAudio";
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
import { GREETINGS_AUDIO, GREETINGS_PHRASES } from "./src/data/greetingsAudio";
import { HEALTH_AUDIO, HEALTH_ENTRIES } from "./src/data/healthAudio";
import {
  HOUSEHOLD_OBJECTS_AUDIO,
  HOUSEHOLD_OBJECTS_ENTRIES,
} from "./src/data/householdObjectsAudio";
import {
  NUMBERS_MONEY_AUDIO,
  NUMBERS_MONEY_ENTRIES,
} from "./src/data/numbersMoneyAudio";
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
  WEATHER_NATURE_AUDIO,
  WEATHER_NATURE_ENTRIES,
} from "./src/data/weatherNatureAudio";
import { GREETINGS_STORY_AUDIO } from "./src/data/greetingsStoryAudio";
import { VISUAL_KEY_OVERRIDES_BY_IGBO } from "./src/data/illustrationOverrides";
import GameGroup from "./src/groups/GameGroup";
import HomeGroup from "./src/groups/HomeGroup";
import LessonGroup from "./src/groups/LessonGroup";
import {
  CompletedLessonScreen,
  LessonsScreen,
  QuizScreen,
} from "./src/app/screens";
import { styles } from "./src/app/styles";
import {
  logoutPremiumAccess,
  purchasePremiumAccess,
  restorePremiumPurchases,
  restorePremiumStatus,
} from "./src/services/premiumPurchase";

type ScreenName = "home" | "lessons" | "quiz" | "completed";
type AppGroup = "home" | "lesson" | "game";
type FeedbackState = "correct" | "wrong" | null;

type StorySpeaker = "dad" | "daughter";

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
  audioKey: string;
  voice: "male" | "female";
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

type RemovableSubscription = {
  remove: () => void;
};

const STORAGE_KEY = "igbo-made-easy.lesson-progress.v1";
const PREMIUM_UNLOCK_STORAGE_KEY = "igbo-made-easy.premium-unlock.v1";
const PREMIUM_EMAIL_STORAGE_KEY = "igbo-made-easy.premium-email.v1";
const GREETINGS_STORY_DIALOGUE = require("./assets/audio/greetings/story-dialogue.json") as StoryDialogueEntry[];
const EVERYDAY_VERBS_STORY_DIALOGUE = require("./assets/audio/everyday-verbs/story-dialogue.json") as StoryDialogueEntry[];
const ASKING_QUESTIONS_STORY_DIALOGUE = require("./assets/audio/asking-questions/story-dialogue.json") as StoryDialogueEntry[];
const FOOD_COOKING_STORY_DIALOGUE = require("./assets/audio/food-cooking/story-dialogue.json") as StoryDialogueEntry[];
const FAMILY_PEOPLE_STORY_DIALOGUE = require("./assets/audio/family-people/story-dialogue.json") as StoryDialogueEntry[];
const SCHOOL_WORK_STORY_DIALOGUE = require("./assets/audio/school-work/story-dialogue.json") as StoryDialogueEntry[];
const TRANSPORTATION_STORY_DIALOGUE = require("./assets/audio/transportation/story-dialogue.json") as StoryDialogueEntry[];

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

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
const NUMBERS_MONEY_TRANSLATIONS = require("./assets/audio/numbers-money/translations.json") as Record<
  string,
  string
>;
const SCHOOL_WORK_TRANSLATIONS = require("./assets/audio/school-work/translations.json") as Record<
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

const LESSON_TRANSLATIONS: Record<string, Record<string, string>> = {
  greetings: GREETINGS_TRANSLATIONS,
  "everyday-verbs": EVERYDAY_VERBS_TRANSLATIONS,
  "asking-questions": ASKING_QUESTIONS_TRANSLATIONS,
  "family-people": FAMILY_PEOPLE_TRANSLATIONS,
  "food-cooking": FOOD_COOKING_TRANSLATIONS,
  "numbers-money": NUMBERS_MONEY_TRANSLATIONS,
  "school-work": SCHOOL_WORK_TRANSLATIONS,
  transportation: TRANSPORTATION_TRANSLATIONS,
  emotions: EMOTIONS_TRANSLATIONS,
  health: HEALTH_TRANSLATIONS,
  "household-objects": HOUSEHOLD_OBJECTS_TRANSLATIONS,
  "weather-nature": WEATHER_NATURE_TRANSLATIONS,
  animals: ANIMALS_TRANSLATIONS,
  elders: ELDERS_TRANSLATIONS,
  celebrations: CELEBRATIONS_TRANSLATIONS,
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
  ...ELDERS_AUDIO,
  ...EMOTIONS_AUDIO,
  ...GREETINGS_AUDIO,
  ...HEALTH_AUDIO,
  ...HOUSEHOLD_OBJECTS_AUDIO,
  ...NUMBERS_MONEY_AUDIO,
  ...SCHOOL_WORK_AUDIO,
  ...SCHOOL_WORK_STORY_AUDIO,
  ...TRANSPORTATION_AUDIO,
  ...TRANSPORTATION_STORY_AUDIO,
  ...WEATHER_NATURE_AUDIO,
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
};

const SENTENCE_BUILDER_BANK: Record<string, SentenceBuilderSeed[]> = {
  greetings: buildGreetingSentenceSeeds(),
  "everyday-verbs": buildSentenceSeedsFromEntries(EVERYDAY_VERBS_ENTRIES),
  "asking-questions": buildSentenceSeedsFromEntries(ASKING_QUESTIONS_ENTRIES),
  "family-people": buildSentenceSeedsFromEntries(FAMILY_PEOPLE_ENTRIES),
  "food-cooking": buildSentenceSeedsFromEntries(FOOD_COOKING_ENTRIES),
  "numbers-money": buildSentenceSeedsFromEntries(NUMBERS_MONEY_ENTRIES),
  "school-work": buildSentenceSeedsFromEntries(SCHOOL_WORK_ENTRIES),
  transportation: buildSentenceSeedsFromEntries(TRANSPORTATION_ENTRIES),
  emotions: buildSentenceSeedsFromEntries(EMOTIONS_ENTRIES),
  health: buildSentenceSeedsFromEntries(HEALTH_ENTRIES),
  "household-objects": buildSentenceSeedsFromEntries(HOUSEHOLD_OBJECTS_ENTRIES),
  "weather-nature": buildSentenceSeedsFromEntries(WEATHER_NATURE_ENTRIES),
  animals: buildSentenceSeedsFromEntries(ANIMALS_ENTRIES),
  elders: buildSentenceSeedsFromEntries(ELDERS_ENTRIES),
  celebrations: buildSentenceSeedsFromEntries(CELEBRATIONS_ENTRIES),
};

const QUESTION_BANK: Record<string, Question[]> = {
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
};

const LESSON_DEFS = [
  { id: "greetings", title: "Greetings" },
  { id: "everyday-verbs", title: "Everyday Verbs" },
  { id: "asking-questions", title: "Asking Questions" },
  { id: "family-people", title: "Family and People" },
  { id: "food-cooking", title: "Food and Cooking" },
  { id: "numbers-money", title: "Numbers and Money" },
  { id: "school-work", title: "School and Work" },
  { id: "transportation", title: "Transportation" },
  { id: "emotions", title: "Emotions" },
  { id: "health", title: "Health" },
  { id: "household-objects", title: "Household Objects" },
  { id: "weather-nature", title: "Weather and Nature" },
  { id: "animals", title: "Animals" },
  { id: "elders", title: "Elders" },
  { id: "celebrations", title: "Celebrations" },
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
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [isHintModalOpen, setIsHintModalOpen] = useState(false);
  const [audioPlaybackRate, setAudioPlaybackRate] = useState<0.5 | 1>(1);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
  const [isAuthBusy, setIsAuthBusy] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const isAudioLoadingRef = useRef(false);
  const isAudioPlayingRef = useRef(false);
  const activePlayerRef = useRef<ReturnType<typeof createAudioPlayer> | null>(
    null
  );
  const activePlayerSubscriptionRef = useRef<RemovableSubscription | null>(null);
  const feedbackPlayerRef = useRef<ReturnType<typeof createAudioPlayer> | null>(
    null
  );

  useEffect(() => {
    const restorePremiumState = async () => {
      try {
        const [savedPremium, savedEmail] = await Promise.all([
          AsyncStorage.getItem(PREMIUM_UNLOCK_STORAGE_KEY),
          AsyncStorage.getItem(PREMIUM_EMAIL_STORAGE_KEY),
        ]);

        const unlocked = savedPremium === "true";
        setHasPremiumAccess(unlocked);
        setIsLoggedIn(unlocked);

        if (savedEmail) {
          setSignupEmail(savedEmail);

          try {
            const hasActiveSubscription = await restorePremiumStatus(savedEmail);
            setHasPremiumAccess(hasActiveSubscription);
            setIsLoggedIn(hasActiveSubscription);

            await AsyncStorage.setItem(
              PREMIUM_UNLOCK_STORAGE_KEY,
              hasActiveSubscription ? "true" : "false"
            );
          } catch {
            // Keep locally cached premium state if remote status cannot load.
          }
        }
      } catch {
        setHasPremiumAccess(false);
        setIsLoggedIn(false);
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
    if (!activeQuestion) {
      return [];
    }

    if (activeQuestion.sentenceBuilder) {
      return [
        {
          word: activeQuestion.answer,
          meaning: activeQuestion.sentenceBuilder.sourceSentence,
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
    if (!activeLessonId || !activeQuestion || activeQuestion.sentenceBuilder) {
      return [];
    }

    return buildLessonChoices(activeLessonId, activeQuestion);
  }, [activeLessonId, activeQuestion]);

  useEffect(() => {
    return () => {
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

  const toggleAudioPlaybackRate = useCallback(() => {
    setAudioPlaybackRate((currentRate) => {
      const nextRate: 0.5 | 1 = currentRate === 1 ? 0.5 : 1;

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

    setIsUpgradeModalOpen(true);
  }, [hasPremiumAccess, isAuthBusy]);

  const handleLogout = useCallback(async () => {
    if (isAuthBusy) {
      return;
    }

    setIsAuthBusy(true);

    try {
      await AsyncStorage.multiRemove([
        PREMIUM_UNLOCK_STORAGE_KEY,
        PREMIUM_EMAIL_STORAGE_KEY,
      ]);
      await logoutPremiumAccess();
      setSignupEmail("");
      setIsLoggedIn(false);
      setHasPremiumAccess(false);
      setIsUpgradeModalOpen(false);
    } finally {
      setIsAuthBusy(false);
    }
  }, [isAuthBusy]);

  const handleUpgradeSubmit = useCallback(async () => {
    const trimmedEmail = signupEmail.trim().toLowerCase();
    if (!isValidEmail(trimmedEmail)) {
      Alert.alert("Enter a valid email", "Please provide a valid email address.");
      return;
    }

    setIsAuthBusy(true);

    try {
      await AsyncStorage.setItem(PREMIUM_EMAIL_STORAGE_KEY, trimmedEmail);
      const hasPremium = await purchasePremiumAccess(trimmedEmail);

      if (!hasPremium) {
        throw new Error(
          "Purchase completed but premium entitlement is not active yet."
        );
      }

      setSignupEmail(trimmedEmail);
      setHasPremiumAccess(true);
      setIsLoggedIn(true);
      setIsUpgradeModalOpen(false);
      await AsyncStorage.setItem(PREMIUM_UNLOCK_STORAGE_KEY, "true");
      Alert.alert("Premium active", "Your subscription is now active.");
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Upgrade failed. Try again.";
      const friendlyMessage =
        message.includes("No subscription products are currently available")
          ? "No Apple subscription product is available yet. Configure RevenueCat offering + App Store product, then try again."
          : message;
      Alert.alert("Upgrade unavailable", friendlyMessage);
    } finally {
      setIsAuthBusy(false);
    }
  }, [signupEmail]);

  const handleRestorePurchases = useCallback(async () => {
    if (isAuthBusy) {
      return;
    }

    const trimmedEmail = signupEmail.trim().toLowerCase();
    if (!isValidEmail(trimmedEmail)) {
      Alert.alert(
        "Email required",
        "Enter the same email you used for Premium, then tap Restore Purchases again."
      );
      setIsUpgradeModalOpen(true);
      return;
    }

    setIsAuthBusy(true);

    try {
      const restored = await restorePremiumPurchases(trimmedEmail);

      if (!restored) {
        Alert.alert(
          "Nothing to restore",
          "No active premium purchase was found for this account."
        );
        return;
      }

      setHasPremiumAccess(true);
      setIsLoggedIn(true);
      await AsyncStorage.setItem(PREMIUM_UNLOCK_STORAGE_KEY, "true");
      Alert.alert("Premium restored", "Your Premium access is active again.");
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Restore failed. Try again.";
      Alert.alert("Restore unavailable", message);
    } finally {
      setIsAuthBusy(false);
    }
  }, [isAuthBusy, signupEmail]);

  const playActiveAudio = useCallback(async () => {
    if (
      !activeQuestion?.audioKey ||
      isAudioPlayingRef.current ||
      isAudioLoadingRef.current
    ) {
      return;
    }

    const clip = QUESTION_AUDIO[activeQuestion.audioKey];
    if (!clip) {
      return;
    }

    try {
      setIsAudioLoading(true);
      setIsAudioPlaying(false);
      isAudioLoadingRef.current = true;
      isAudioPlayingRef.current = false;

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
          setIsAudioLoading(!status.isLoaded || status.isBuffering);
          setIsAudioPlaying(status.playing);
          isAudioLoadingRef.current = !status.isLoaded || status.isBuffering;
          isAudioPlayingRef.current = status.playing;
        }
      );

      player.setPlaybackRate(audioPlaybackRate);
      player.play();
    } catch {
      setIsAudioLoading(false);
      setIsAudioPlaying(false);
      isAudioLoadingRef.current = false;
      isAudioPlayingRef.current = false;
      // Ignore audio playback errors.
    }
  }, [activeQuestion, audioPlaybackRate]);

  useEffect(() => {
    setIsAudioLoading(false);
    setIsAudioPlaying(false);
    isAudioLoadingRef.current = false;
    isAudioPlayingRef.current = false;
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
            isLoggedIn={isLoggedIn}
            hasPremiumAccess={hasPremiumAccess}
            isAuthBusy={isAuthBusy}
            onLoginPress={handleLoginPress}
            isUpgradeModalOpen={isUpgradeModalOpen}
            signupEmail={signupEmail}
            onSignupEmailChange={setSignupEmail}
            onCloseUpgradeModal={() => {
              if (!isAuthBusy) {
                setIsUpgradeModalOpen(false);
              }
            }}
            onUpgradeSubmit={handleUpgradeSubmit}
            onLogoutPress={handleLogout}
            onRestorePurchasesPress={handleRestorePurchases}
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
            showSpeaker={Boolean(question.audioKey || question.storyMode)}
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
      isUpgradeModalOpen={isUpgradeModalOpen}
      signupEmail={signupEmail}
      onSignupEmailChange={setSignupEmail}
      onCloseUpgradeModal={() => {
        if (!isAuthBusy) {
          setIsUpgradeModalOpen(false);
        }
      }}
      onUpgradeSubmit={handleUpgradeSubmit}
      onLogoutPress={handleLogout}
      onRestorePurchasesPress={handleRestorePurchases}
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

  if (lessonId === "food-cooking") {
    return buildBalancedStoryQuestionSet(FOOD_COOKING_STORY_DIALOGUE);
  }

  if (lessonId === "family-people") {
    return buildBalancedStoryQuestionSet(FAMILY_PEOPLE_STORY_DIALOGUE);
  }

  if (lessonId === "school-work") {
    return buildBalancedStoryQuestionSet(SCHOOL_WORK_STORY_DIALOGUE);
  }

  if (lessonId === "transportation") {
    return buildBalancedStoryQuestionSet(TRANSPORTATION_STORY_DIALOGUE);
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
    const speakerLabel = entry.speaker === "dad" ? "Dad" : "Daughter";

    const statement = shouldBeTrue
      ? entry.statement
      : buildMismatchedStoryStatement(entries, index, speakerLabel);

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
    (item) => !item.sentenceBuilder && !item.storyMode
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
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}
