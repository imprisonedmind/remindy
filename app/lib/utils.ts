// utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export const NOTIFICATIONS_STORAGE_KEY = "app_notifications";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Configure notification handler
export const setNotificationRules = () => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      priority: Notifications.AndroidNotificationPriority.MAX,
    }),
  });
};

// Request permissions including critical alerts
export async function requestNotificationPermissions() {
  const { status } = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
      allowAnnouncements: true,
      allowCriticalAlerts: true,
      provideAppNotificationSettings: true,
    },
    android: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
      allowAnnouncements: true,
    },
  });
  return status;
}

export async function createNotificationChannel() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("high-priority", {
      name: "High Priority Notifications",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "notification_sound", // You can specify a custom sound if needed
      bypassDnd: true, // Bypass Do Not Disturb
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }
}

// format ms to duration
export function formatDuration(ms: number) {
  const seconds = Math.floor(ms / 1000);

  if (seconds < 120) {
    return ` ${seconds} second${seconds === 1 ? "" : "s"}`;
  } else {
    const hours = Math.floor(seconds / 3600);
    return ` ${hours} hour${hours === 1 ? "" : "s"}`;
  }
}

// Utility function to convert interval to milliseconds
export const getIntervalInMs = (interval: number) => {
  return interval < 1 ? 30000 : interval * 3600000;
};

// Calculate the next trigger time based on creation time
export const calculateNextTrigger = (createdAt: number, intervalMs: number) => {
  const now = Date.now();
  const timeSinceCreation = now - createdAt;
  const completedIntervals = Math.floor(timeSinceCreation / intervalMs);
  return createdAt + (completedIntervals + 1) * intervalMs;
};

// handle schedule notification
export const scheduleNotification = async (reminder: {
  id: string;
  title: string;
  description: string;
  interval: string;
  createdAt: number;
}) => {
  try {
    // Cancel any existing notification with this ID
    await Notifications.cancelScheduledNotificationAsync(reminder.id);

    // Calculate the first trigger time
    const intervalMs = getIntervalInMs(parseFloat(reminder.interval));
    const nextTrigger = calculateNextTrigger(reminder.createdAt, intervalMs);
    const secondsUntilTrigger = Math.ceil((nextTrigger - Date.now()) / 1000);

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: reminder.title,
        body: reminder.description,
        priority: Notifications.AndroidNotificationPriority.MAX,
      },
      trigger: {
        seconds: secondsUntilTrigger,
        repeats: true,
      },
      identifier: reminder.id,
    });

    return notificationId;
  } catch (error) {
    console.error("Error scheduling notification:", error);
    throw error;
  }
};
