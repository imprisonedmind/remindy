import { Text, TouchableOpacity, View } from "react-native";
import {
  requestNotificationPermissions,
  testNotification,
} from "@/app/lib/utils";

export default function Modal() {
  return (
    <View className="bg-gray-100 flex-1 p-3">
      <View className="flex-1 bg-white rounded-xl pt-6 items-center justify-center">
        <TouchableOpacity onPress={requestNotificationPermissions}>
          <Text>Test</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={testNotification}>
          <Text>Test2</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
