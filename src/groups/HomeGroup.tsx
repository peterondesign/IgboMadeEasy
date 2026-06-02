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
  styles: Record<string, any>;
};

export default function HomeGroup({
  onGetStarted,
  onDemoReminderTest,
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
          ) : null}
        </View>

        <View style={styles.homeHeroWrap}>
          <HeroIllustration width="100%" height="100%" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
