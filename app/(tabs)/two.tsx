import { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NOTIFICATIONS_STORAGE_KEY } from "@/lib/utils";
import { Picker } from "@react-native-picker/picker";
import { NotificationData } from "@/lib/types";
import { router } from "expo-router";
import { scheduleNotification } from "@/app/lib/utils";

export default function CreateNotificationScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [interval, setInterval] = useState("0.00833"); // Default to test interval

  const saveNotification = async (newNotification: NotificationData) => {
    try {
      const savedNotifications = await AsyncStorage.getItem(
        NOTIFICATIONS_STORAGE_KEY,
      );
      const currentNotifications = savedNotifications
        ? JSON.parse(savedNotifications)
        : [];

      const updatedNotifications = [
        ...currentNotifications,
        newNotification, // Use the notification with predefined ID
      ];
      await AsyncStorage.setItem(
        NOTIFICATIONS_STORAGE_KEY,
        JSON.stringify(updatedNotifications),
      );
      router.back();
    } catch (error) {
      console.error("Error saving notification:", error);
      Alert.alert("Error", "Failed to save reminder.");
    }
  };

  const handleSaveNotification = async () => {
    if (!title || !description) {
      Alert.alert(
        "Validation Error",
        "Please enter both title and description.",
      );
      return;
    }

    // Generate a fixed UUID for the notification
    const fixedId = Date.now().toString();
    const createdAt = Date.now();

    const newNotification = {
      id: fixedId,
      title,
      description,
      interval,
      createdAt,
    };

    // Schedule the notification first to ensure we can store its ID
    const scheduledNotificationId = await scheduleNotification(newNotification);

    if (scheduledNotificationId) {
      // Add the scheduled notification ID to the notification object
      newNotification["notificationId"] = scheduledNotificationId;

      await saveNotification(newNotification);

      // Reset form
      setTitle("");
      setDescription("");
      setInterval("0.00833");

      Alert.alert("Success", "Reminder created successfully!");
    }
  };

  return (
    <View className="flex-1 bg-neutral-100 p-4">
      <View className="gap-6 bg-white rounded-xl p-4 border border-neutral-200">
        <View className={"flex-col gap-2"}>
          <TextInput
            className="border border-gray-300 p-2 rounded"
            placeholder="Reminder Title"
            value={title}
            onChangeText={setTitle}
          />

          <TextInput
            className="border border-gray-300 p-2 rounded"
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <View className="border border-gray-300 rounded">
            <Picker selectedValue={interval} onValueChange={setInterval}>
              <Picker.Item
                key="test"
                label="Every 30 seconds (Testing)"
                value="0.00833"
              />
              {[1, 2, 3, 4, 6, 8, 12, 24].map((hours) => (
                <Picker.Item
                  key={hours}
                  label={hours > 1 ? `Every ${hours} hours` : "Every hour"}
                  value={hours.toString()}
                />
              ))}
            </Picker>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSaveNotification}
          className="bg-blue-500 p-4 rounded-lg"
        >
          <Text className="text-white text-center font-bold">
            Save Reminder
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
