import { useEffect, useState } from "react";
import { cn, deleteNotification, loadNotifications } from "@/lib/utils";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { router, useSegments } from "expo-router";
import { NotificationData } from "@/lib/types";
import { NotificationCountdown } from "@/components/countDownTimer";
import { formatDuration, getIntervalInMs } from "@/app/lib/utils";

export default function TabOneScreen() {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const loadLocalNotifications = async () => {
    let localNotifications = await loadNotifications();
    // TODO: dont use !!
    setNotifications(localNotifications);
  };

  // Load saved notifications when the component mounts
  useEffect(() => {
    loadLocalNotifications();
  }, [useSegments()]);

  const handleDelete = async (id: string) => {
    let localNotifications = await deleteNotification({
      id: id,
      notifications,
    });
    // TODO: dont use !!
    setNotifications(localNotifications!);
  };

  return (
    <View className="flex-1 bg-neutral-100 p-4">
      {notifications.length <= 0 && (
        <Text className={"m-auto"}>No Reminders yet</Text>
      )}

      <FlatList
        data={notifications}
        renderItem={({ item }: { item: NotificationData }) => (
          <View className="bg-white my-2 p-4 rounded-lg border border-neutral-200 gap-4">
            <View className={"gap-2"}>
              <View>
                <Text className="font-bold text-lg">{item.title}</Text>
                <Text className="text-gray-600">{item.description}</Text>
              </View>
              <View>
                <Text className="text-gray-500">
                  Repeats every
                  {formatDuration(getIntervalInMs(parseInt(item.interval)))}
                </Text>
                <NotificationCountdown
                  interval={parseInt(item.interval)}
                  createdAt={parseInt(item.createdAt)}
                />
              </View>
            </View>
            <TouchableOpacity
              onPress={() => handleDelete(item.id)}
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
