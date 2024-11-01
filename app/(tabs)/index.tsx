import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { cn, NOTIFICATIONS_STORAGE_KEY } from "@/lib/utils";
import { Alert, FlatList, Text, TouchableOpacity, View } from "react-native";
import { router, useSegments } from "expo-router";
import { NotificationData } from "@/lib/types";
import * as Notifications from "expo-notifications";
import { NotificationCountdown } from "@/components/countDownTimer";
import { formatDuration, getIntervalInMs } from "@/app/lib/utils";

export default function TabOneScreen() {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  // Load saved notifications when the component mounts
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const savedNotifications = await AsyncStorage.getItem(
          NOTIFICATIONS_STORAGE_KEY,
        );
        const parsedNotifications = savedNotifications
          ? JSON.parse(savedNotifications)
          : [];

        setNotifications(parsedNotifications);
      } catch (error) {
        console.error("Error loading notifications:", error);
      }
    };

    loadNotifications();
  }, [useSegments()]);

  // delete specific notification
  const deleteNotification = async (id: string) => {
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

      setNotifications(updatedNotifications);
      await AsyncStorage.setItem(
        NOTIFICATIONS_STORAGE_KEY,
        JSON.stringify(updatedNotifications),
      );

      Alert.alert("Success", "Reminder deleted successfully!");
    } catch (error) {
      console.error("Error deleting notification:", error);
      Alert.alert("Error", "Failed to delete reminder.");
    }
  };

  return (
    <View className="flex-1 bg-neutral-100 p-4">
      {notifications.length <= 0 && (
        <Text className={"m-auto"}>No Reminders yet</Text>
      )}

      <FlatList
        data={notifications}
        renderItem={({ item }: { item: NotificationData }) => (
          <View className="bg-white my-2 p-4 rounded-lg">
            <Text className="font-bold text-lg">{item.title}</Text>
            <Text className="text-gray-600">{item.description}</Text>
            <Text className="text-gray-500">
              Repeats every
              {formatDuration(getIntervalInMs(parseInt(item.interval)))}
            </Text>
            <NotificationCountdown
              interval={parseInt(item.interval)}
              createdAt={parseInt(item.createdAt)}
            />
            <TouchableOpacity
              onPress={() => deleteNotification(item.id)}
              className="bg-red-500 p-2 rounded mt-2"
            >
              <Text className="text-white text-center">Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />

      <TouchableOpacity
        onPress={() => router.push("/two")}
        className={cn(
          "w-full p-4 py-6 bg-blue-500 text rounded-3xl border-blue-100 border-4",
          " shadow-md text-lg",
        )}
      >
        <Text className={"text-white w-fit mx-auto"}>Create New Reminder</Text>
      </TouchableOpacity>
    </View>
  );
}
