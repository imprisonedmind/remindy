import { useEffect, useRef, useState } from "react";
import { Text } from "react-native";
import { calculateNextTrigger, getIntervalInMs } from "@/app/lib/utils";

interface NotificationTimerProps {
  interval: number;
  createdAt: number;
}

export function NotificationCountdown({
  interval,
  createdAt,
}: NotificationTimerProps) {
  const [timeLeft, setTimeLeft] = useState("");
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const calculateTimeLeft = () => {
      try {
        const intervalMs = getIntervalInMs(interval);
        const nextTrigger = calculateNextTrigger(createdAt, intervalMs);
        const diff = nextTrigger - Date.now();

        if (diff <= 0) return "triggering now";

        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);

        if (hours > 0) {
          return `in ${hours}h ${minutes}m`;
        } else if (minutes > 0) {
          return `in ${minutes}m ${seconds}s`;
        } else {
          return `in ${seconds}s`;
        }
      } catch (error) {
        console.error("Error calculating time:", error);
        return "calculating...";
      }
    };

    setTimeLeft(calculateTimeLeft());
    timerRef.current = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [interval, createdAt]);

  return (
    <Text className="text-blue-500 font-medium">Next trigger: {timeLeft}</Text>
  );
}
