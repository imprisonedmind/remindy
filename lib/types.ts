export interface NotificationData {
  id: string;
  title: string;
  description: string;
  interval: string;
  createdAt: string;
  notificationId?: string; // Optional property for the scheduled notification ID
}
