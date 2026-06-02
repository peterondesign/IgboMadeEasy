import * as Notifications from "expo-notifications";

const MORNING_REMINDER_BODY = "Ụtụtụ ọma! Time for an Igbo lesson.";
const NIGHT_REMINDER_BODY = "Tupu ị laa ụra, One Igbo lesson tonight.";
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

  await Notifications.scheduleNotificationAsync({
    content: buildReminderContent(
      `${REMINDER_TYPE_PREFIX}-morning`,
      MORNING_REMINDER_BODY
    ),
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 8,
      minute: 0,
    },
  });

  await Notifications.scheduleNotificationAsync({
    content: buildReminderContent(
      `${REMINDER_TYPE_PREFIX}-night`,
      NIGHT_REMINDER_BODY
    ),
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 20,
      minute: 0,
    },
  });

  return {
    hasPermission: true,
    scheduledCount: 2,
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
      MORNING_REMINDER_BODY
    ),
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 2,
    },
  });

  await Notifications.scheduleNotificationAsync({
    content: buildReminderContent(
      `${REMINDER_TYPE_PREFIX}-demo-night`,
      NIGHT_REMINDER_BODY
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
