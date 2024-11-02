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
      priority: Notifications.AndroidNotificationPriority.HIGH,
    }),
  });
};

// Request permissions including critical alerts
export async function requestNotificationPermissions() {
  try {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          allowAnnouncements: true,
        },
        android: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      throw new Error("Permission not granted!");
    }

    // Get the token
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: "31374dfa-ee6d-4865-adb6-300af5056f71", // Your project ID from app.json
    });
    console.log("Push token:", token);
  } catch (error) {
    console.error("Error requesting notification permissions:", error);
  }
}

// setup notification channel on android
export async function createNotificationChannel() {
  if (Platform.OS === "android") {
    try {
      // First, delete any existing channel with this ID
      await Notifications.deleteNotificationChannelAsync("high-priority");

      // Create the channel
      await Notifications.setNotificationChannelAsync("high-priority", {
        name: "High Priority Notifications",
        description: "This channel is used for important notifications.", // Android requires this
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        enableVibrate: true,
        enableLights: true,
        lightColor: "#FF231F7C",
        lockscreenVisibility:
          Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: true,
        sound: "notification_sound.wav",
      });

      // Verify channel creation
      const channel =
        await Notifications.getNotificationChannelAsync("high-priority");
      console.log("Created channel:", channel);
    } catch (error) {
      console.error("Error creating notification channel:", error);
    }
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
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        seconds: secondsUntilTrigger,
        repeats: true,
        channelId: "high-priority",
      },
      identifier: reminder.id,
    });

    return notificationId;
  } catch (error) {
    console.error("Error scheduling notification:", error);
    throw error;
  }
};

// Add this function to check if notifications are working
export async function checkNotificationPermissions() {
  const settings = await Notifications.getPermissionsAsync();
  console.log("Notification settings:", settings);

  const channels = await Notifications.getNotificationChannelsAsync();
  console.log("Available channels:", channels);
}

export async function testNotification() {
  try {
    // Make sure channel exists first
    await createNotificationChannel();

    const notification = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Test Notification",
        body: "Testing sound...",
        data: { data: "goes here" },
        sound: "notification_sound.wav",
        priority: "max",
      },
      trigger: {
        seconds: 2,
        channelId: "high-priority", // Specify the channel ID
      },
    });

    console.log("Scheduled notification:", notification);
  } catch (error) {
    console.error("Error scheduling notification:", error);
  }
}
