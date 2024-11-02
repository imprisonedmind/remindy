import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { NotificationData } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const NOTIFICATIONS_STORAGE_KEY = "@notifications";

// load notifications to the UI
export async function loadNotifications() {
  try {
    const savedNotifications = await AsyncStorage.getItem(
      NOTIFICATIONS_STORAGE_KEY,
    );
    const parsedNotifications = savedNotifications
      ? JSON.parse(savedNotifications)
      : [];

    return parsedNotifications;
  } catch (error) {
    console.error("Error loading notifications:", error);
  }
}

// delete specific notification
interface deleteNotificationProps {
  id: string;
  notifications: NotificationData[];
}

export async function deleteNotification({
  id,
  notifications,
}: deleteNotificationProps) {
  try {
    const notificationToDelete = notifications.find(
      (notification) => notification.id === id,
    );

    if (notificationToDelete?.notificationId) {
      // Cancel the scheduled notification using its ID
      await Notifications.cancelScheduledNotificationAsync(
        notificationToDelete.notificationId,
      );
    }

    // Remove it from the state and storage
    const updatedNotifications = notifications.filter(
      (notification) => notification.id !== id,
    );

    await AsyncStorage.setItem(
      NOTIFICATIONS_STORAGE_KEY,
      JSON.stringify(updatedNotifications),
    );

    Alert.alert("Success", "Reminder deleted successfully!");

    return updatedNotifications;
  } catch (error) {
    console.error("Error deleting notification:", error);
    Alert.alert("Error", "Failed to delete reminder.");
  }
}
