import * as Notifications from "expo-notifications";

const MORNING_REMINDER_VARIATIONS = [
  "Ndewo 👋 Ready for 2 minutes?",
  "Daalụ starts with one lesson.",
  "Olee? Can you understand today's sentence?",
  "Nnọọ. Your next Igbo lesson is waiting.",
  "Biko, learn one sentence today.",
  "Aha, okwu, mkparịta ụka. Start today's lesson.",
  "Learn something your ezinụlọ might say.",
  "Today's conversation is ready. Ka anyị gaa.",
];
const NIGHT_REMINDER_VARIATIONS = [
  "Ndo. No Igbo today.",
  "Today isn't over yet. Biko.",
  "One sentence before bed. Daalụ.",
  "No lesson completed today. Ka anyị gaa.",
  "Your future self speaks Igbo. Nnọọ.",
  "Someone will tell a story in Igbo. Olee?",
  "One lesson. That's enough. Biko.",
  "Tomorrow's conversation starts today. Daalụ.",
  "Learn one thing today. Ka ọ dị?",
  "Your streak is waiting. Ndewo.",
];
const REMINDER_TYPE_PREFIX = "lesson-reminder";

let notificationsConfigured = false;

function configureNotificationBehavior() {
  if (notificationsConfigured) {
    return;
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  notificationsConfigured = true;
}

async function ensureNotificationPermission(): Promise<boolean> {
  configureNotificationBehavior();

  const currentSettings = await Notifications.getPermissionsAsync();
  if (currentSettings.granted || currentSettings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return true;
  }

  const requestedSettings = await Notifications.requestPermissionsAsync();
  return (
    requestedSettings.granted ||
    requestedSettings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
}

async function clearScheduledLessonReminderNotifications() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const reminderIdentifiers = scheduled
    .filter((item) => {
      const reminderType = item.content.data?.reminderType;
      return (
        typeof reminderType === "string" &&
        reminderType.startsWith(REMINDER_TYPE_PREFIX)
      );
    })
    .map((item) => item.identifier);

  await Promise.all(
    reminderIdentifiers.map((identifier) =>
      Notifications.cancelScheduledNotificationAsync(identifier)
    )
  );
}

function buildReminderContent(reminderType: string, body: string): Notifications.NotificationContentInput {
  return {
    title: "Igbo Made Easy",
    body,
    data: {
      reminderType,
    },
    sound: true,
  };
}

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function getRandomTimeInWindow(
  startHour: number,
  endHourInclusive: number
): { hour: number; minute: number } {
  const hourRange = endHourInclusive - startHour + 1;
  const hour = startHour + Math.floor(Math.random() * Math.max(hourRange, 1));
  return {
    hour,
    minute: Math.floor(Math.random() * 60),
  };
}

export async function syncDailyLessonReminderNotifications(options: {
  hasCompletedLessonToday: boolean;
}) {
  const hasPermission = await ensureNotificationPermission();
  if (!hasPermission) {
    return {
      hasPermission: false,
      scheduledCount: 0,
    };
  }

  await clearScheduledLessonReminderNotifications();

  if (options.hasCompletedLessonToday) {
    return {
      hasPermission: true,
      scheduledCount: 0,
    };
  }

  const morningTime = getRandomTimeInWindow(10, 11);
  const nightTime = getRandomTimeInWindow(20, 21);
  const lateNightTime = getRandomTimeInWindow(23, 23);

  await Notifications.scheduleNotificationAsync({
    content: buildReminderContent(
      `${REMINDER_TYPE_PREFIX}-morning`,
      pickRandom(MORNING_REMINDER_VARIATIONS)
    ),
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: morningTime.hour,
      minute: morningTime.minute,
    },
  });

  await Notifications.scheduleNotificationAsync({
    content: buildReminderContent(
      `${REMINDER_TYPE_PREFIX}-night`,
      pickRandom(NIGHT_REMINDER_VARIATIONS)
    ),
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: nightTime.hour,
      minute: nightTime.minute,
    },
  });

  await Notifications.scheduleNotificationAsync({
    content: buildReminderContent(
      `${REMINDER_TYPE_PREFIX}-late-night`,
      pickRandom(NIGHT_REMINDER_VARIATIONS)
    ),
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: lateNightTime.hour,
      minute: lateNightTime.minute,
    },
  });

  return {
    hasPermission: true,
    scheduledCount: 3,
  };
}

export async function scheduleDemoLessonReminderNotifications() {
  const hasPermission = await ensureNotificationPermission();
  if (!hasPermission) {
    return {
      hasPermission: false,
      scheduledCount: 0,
    };
  }

  await Notifications.scheduleNotificationAsync({
    content: buildReminderContent(
      `${REMINDER_TYPE_PREFIX}-demo-morning`,
      pickRandom(MORNING_REMINDER_VARIATIONS)
    ),
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 2,
    },
  });

  await Notifications.scheduleNotificationAsync({
    content: buildReminderContent(
      `${REMINDER_TYPE_PREFIX}-demo-night`,
      pickRandom(NIGHT_REMINDER_VARIATIONS)
    ),
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 5,
    },
  });

  return {
    hasPermission: true,
    scheduledCount: 2,
  };
}
