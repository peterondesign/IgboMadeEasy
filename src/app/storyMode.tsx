import { Pressable, Text, View } from "react-native";
import StoryDadIllustration from "../../assets/illustrations/story-dad.svg";
import StoryDaughterIllustration from "../../assets/illustrations/story-daughter.svg";
import StoryGranddaughterIllustration from "../../assets/illustrations/story-granddaughter.svg";
import StoryDoveIllustration from "../../assets/illustrations/story-dove.svg";
import { styles } from "./styles";

export type StorySpeaker = "dad" | "daughter" | "granddaughter" | "dove";

export type StoryModeQuestion = {
  speaker: StorySpeaker;
  igboText: string;
  englishText: string;
  statement: string;
  correctAnswer: boolean;
  dadSvgPath: string;
  daughterSvgPath: string;
};

const STORY_CHARACTER_LABELS: Record<StorySpeaker, string> = {
  dad: "Dad",
  daughter: "Daughter",
  granddaughter: "Granddaughter",
  dove: "Dove",
};

function resolveCompanionSpeaker(story: StoryModeQuestion): StorySpeaker {
  const normalizedPath = story.daughterSvgPath.toLowerCase();

  if (normalizedPath.includes("story-granddaughter")) {
    return "granddaughter";
  }

  if (normalizedPath.includes("story-dove")) {
    return "dove";
  }

  return "daughter";
}

function CharacterCard({
  label,
  isActive,
  illustration,
}: {
  label: string;
  isActive: boolean;
  illustration: StorySpeaker;
}) {
  const Illustration =
    illustration === "dad"
      ? StoryDadIllustration
      : illustration === "granddaughter"
        ? StoryGranddaughterIllustration
        : illustration === "dove"
          ? StoryDoveIllustration
        : StoryDaughterIllustration;

  return (
    <View style={[styles.storyCharacterWrap, isActive && styles.storyCharacterWrapActive]}>
      <View style={styles.storyCharacterIllustrationWrap}>
        <Illustration width="100%" height="100%" />
      </View>
      <Text style={styles.storyCharacterLabel}>{label}</Text>
    </View>
  );
}

export default function StoryMode({
  story,
  selectedAnswer,
  onSelectAnswer,
}: {
  story: StoryModeQuestion;
  selectedAnswer: string;
  onSelectAnswer: (value: string) => void;
}) {
  const isDadSpeaking = story.speaker === "dad";
  const companionSpeaker = resolveCompanionSpeaker(story);

  return (
    <View style={styles.storyModeWrap}>
      <View
        style={[
          styles.storyBubbleWrap,
          isDadSpeaking ? styles.storyBubbleWrapLeft : styles.storyBubbleWrapRight,
        ]}
      >
        <View style={styles.storyBubble}>
          <Text style={styles.storyBubbleIgbo}>{story.igboText}</Text>
          <Text style={styles.storyBubbleEnglish}>{story.englishText}</Text>
        </View>
        <View
          style={[
            styles.storyBubbleTail,
            isDadSpeaking ? styles.storyBubbleTailLeft : styles.storyBubbleTailRight,
          ]}
        />
      </View>

      <View style={styles.storyCharactersRow}>
        <CharacterCard
          label={STORY_CHARACTER_LABELS.dad}
          isActive={story.speaker === "dad"}
          illustration="dad"
        />
        <CharacterCard
          label={STORY_CHARACTER_LABELS[companionSpeaker]}
          isActive={story.speaker !== "dad"}
          illustration={companionSpeaker}
        />
      </View>

      <Text style={styles.storyStatementText}>{story.statement}</Text>

      <View style={styles.storyChoiceRow}>
        {(["True", "False"] as const).map((choice) => {
          const isSelected = selectedAnswer === choice;

          return (
            <Pressable
              key={choice}
              onPress={() => onSelectAnswer(choice)}
              style={[
                styles.storyChoiceButton,
                isSelected && styles.storyChoiceButtonSelected,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Choose ${choice}`}
            >
              <Text
                style={[
                  styles.storyChoiceButtonText,
                  isSelected && styles.storyChoiceButtonTextSelected,
                ]}
              >
                {choice}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
