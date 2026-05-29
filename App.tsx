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
  ASKING_QUESTIONS_AUDIO,
  ASKING_QUESTIONS_ENTRIES,
} from "./src/data/askingQuestionsAudio";
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
import {
  FAMILY_PEOPLE_AUDIO,
  FAMILY_PEOPLE_ENTRIES,
} from "./src/data/familyPeopleAudio";
import {
  FOOD_COOKING_AUDIO,
  FOOD_COOKING_ENTRIES,
} from "./src/data/foodCookingAudio";
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
import {
  TRANSPORTATION_AUDIO,
  TRANSPORTATION_ENTRIES,
} from "./src/data/transportationAudio";
import {
  WEATHER_NATURE_AUDIO,
  WEATHER_NATURE_ENTRIES,
} from "./src/data/weatherNatureAudio";
import { VISUAL_KEY_OVERRIDES_BY_IGBO } from "./src/data/illustrationOverrides";
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

type RemovableSubscription = {
  remove: () => void;
};

const STORAGE_KEY = "igbo-made-easy.lesson-progress.v1";
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
  ...ANIMALS_AUDIO,
  ...CELEBRATIONS_AUDIO,
  ...ELDERS_AUDIO,
  ...EMOTIONS_AUDIO,
  ...GREETINGS_AUDIO,
  ...HEALTH_AUDIO,
  ...HOUSEHOLD_OBJECTS_AUDIO,
  ...NUMBERS_MONEY_AUDIO,
  ...SCHOOL_WORK_AUDIO,
  ...TRANSPORTATION_AUDIO,
  ...WEATHER_NATURE_AUDIO,
  ...EVERYDAY_VERBS_AUDIO,
  ...FAMILY_PEOPLE_AUDIO,
  ...FOOD_COOKING_AUDIO,
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
  "numbers-money": buildMixedQuestionSet(
    WORD_QUESTION_BANK["numbers-money"],
    SENTENCE_BUILDER_BANK["numbers-money"]
  ),
  "school-work": buildMixedQuestionSet(
    WORD_QUESTION_BANK["school-work"],
    SENTENCE_BUILDER_BANK["school-work"]
  ),
  transportation: buildMixedQuestionSet(
    WORD_QUESTION_BANK.transportation,
    SENTENCE_BUILDER_BANK.transportation
  ),
  emotions: buildMixedQuestionSet(
    WORD_QUESTION_BANK.emotions,
    SENTENCE_BUILDER_BANK.emotions
  ),
  health: buildMixedQuestionSet(
    WORD_QUESTION_BANK.health,
    SENTENCE_BUILDER_BANK.health
  ),
  "household-objects": buildMixedQuestionSet(
    WORD_QUESTION_BANK["household-objects"],
    SENTENCE_BUILDER_BANK["household-objects"]
  ),
  "weather-nature": buildMixedQuestionSet(
    WORD_QUESTION_BANK["weather-nature"],
    SENTENCE_BUILDER_BANK["weather-nature"]
  ),
  animals: buildMixedQuestionSet(
    WORD_QUESTION_BANK.animals,
    SENTENCE_BUILDER_BANK.animals
  ),
  elders: buildMixedQuestionSet(
    WORD_QUESTION_BANK.elders,
    SENTENCE_BUILDER_BANK.elders
  ),
  celebrations: buildMixedQuestionSet(
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
    display: "flex",
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
    paddingBottom: 112,
  },
  quizTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  quizBackIconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#3A3B3F",
    alignItems: "center",
    justifyContent: "center",
  },
  quizHeaderProgressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#45484D",
    overflow: "hidden",
  },
  quizHeaderProgressFill: {
    height: "100%",
    borderRadius: 4,
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
  speakerButtonDisabled: {
    opacity: 0.7,
  },
  speakerSkeletonGlyph: {
    width: 34,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#66717E",
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
  speedToggleButtonDisabled: {
    opacity: 0.6,
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
    fontSize: 18,
    lineHeight: 22,
  },
  quizPromptWordCompact: {
    fontSize: 17,
    lineHeight: 21,
  },
  hintIconButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3A3B3F",
  },
  quizIllustrationSlot: {
    marginTop: 10,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
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
    paddingHorizontal: 4,
  },
  sentenceBuilderWrapCompact: {
    marginTop: 8,
    gap: 6,
    paddingHorizontal: 2,
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
    fontSize: 20,
    lineHeight: 24,
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
    minWidth: 108,
    minHeight: 58,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2A2F3A",
    borderStyle: "dashed",
    backgroundColor: "#10141B",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  slotChipCompact: {
    minWidth: 94,
    minHeight: 50,
    borderRadius: 13,
    paddingHorizontal: 12,
    paddingVertical: 4,
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
    marginTop: 10,
    marginHorizontal: 6,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 30,
  },
  wordBankWrapCompact: {
    marginTop: 8,
    marginHorizontal: 4,
    gap: 21,
  },
  wordBankChip: {
    minHeight: 56,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#2B313D",
    backgroundColor: "#181C23",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 18,
  },
  wordBankChipCompact: {
    minHeight: 48,
    borderRadius: 21,
    paddingHorizontal: 14,
    paddingVertical: 4,
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
    fontSize: 22,
    lineHeight: 26,
    textAlign: "center",
  },
  choiceLabelSelected: {
    color: "#DDF5FF",
  },
  choiceTranslation: {
    marginTop: 2,
    color: "#97A7B8",
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    lineHeight: 17,
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
    minHeight: 4,
  },
  checkButtonFixedWrap: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 16,
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
    fontSize: 16,
    lineHeight: 20,
  },
  hintMeaning: {
    color: "#99A6B4",
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    lineHeight: 18,
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
