import HeroIllustration from "../../assets/hero.svg";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  View,
} from "react-native";

type HomeGroupProps = {
  onGetStarted: () => void;
  onDemoReminderTest: () => void;
  onTogglePremium?: () => void;
  hasPremiumAccess?: boolean;
  styles: Record<string, any>;
};

export default function HomeGroup({
  onGetStarted,
  onDemoReminderTest,
  onTogglePremium,
  hasPremiumAccess,
  styles,
}: HomeGroupProps) {

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#111111" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.homeContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.homeTopContent}>
          <Text style={styles.homeHeadline}>
            Speak Igbo{"\n"}confidently{"\n"}from{" "}
            <Text style={{ fontWeight: "700" }}>day one</Text>
          </Text>

          <Pressable
            style={styles.button}
            accessibilityRole="button"
            onPress={onGetStarted}
          >
            <Text style={styles.buttonText}>Get started</Text>
          </Pressable>

          {__DEV__ ? (
            <>
              <Pressable
                style={{
                  marginTop: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#34465D",
                  backgroundColor: "#1B2533",
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                }}
                accessibilityRole="button"
                onPress={onDemoReminderTest}
              >
                <Text
                  style={{
                    color: "#CFE8FF",
                    fontSize: 14,
                    fontWeight: "600",
                  }}
                >
                  Dev: Demo Reminder Push
                </Text>
              </Pressable>

              <Pressable
                style={{
                  marginTop: 8,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: hasPremiumAccess ? "#2D5A3D" : "#5A3D2D",
                  backgroundColor: hasPremiumAccess ? "#152B1F" : "#2B1A0F",
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                }}
                accessibilityRole="button"
                onPress={onTogglePremium}
              >
                <Text
                  style={{
                    color: hasPremiumAccess ? "#7EFFA8" : "#FFBC7E",
                    fontSize: 14,
                    fontWeight: "600",
                  }}
                >
                  {hasPremiumAccess ? "Dev: Switch to Free" : "Dev: Switch to Premium"}
                </Text>
              </Pressable>
            </>
          ) : null}
        </View>

        <View style={styles.homeHeroWrap}>
          <HeroIllustration width="100%" height="100%" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
