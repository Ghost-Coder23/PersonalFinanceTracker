import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function configureNotifications() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('finance-reminders', {
      name: 'Finance reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

export async function requestNotificationPermissions() {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function scheduleNotification({ title, body, date }) {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) {
    throw new Error('Notification permission was not granted.');
  }

  const triggerDate = new Date(date);
  if (Number.isNaN(triggerDate.getTime())) {
    throw new Error('Invalid notification date.');
  }

  if (triggerDate <= new Date()) {
    throw new Error('Notification date must be in the future.');
  }

  const trigger = {
    type: Notifications.SchedulableTriggerInputTypes.DATE,
    date: triggerDate,
  };

  if (Platform.OS === 'android') {
    trigger.channelId = 'finance-reminders';
  }

  return await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger,
  });
}

export async function scheduleSubscriptionReminder(subscription, daysBefore = 1) {
  const renewalDate = new Date(`${subscription.next_renewal}T09:00:00`);
  const reminderDate = new Date(renewalDate);
  reminderDate.setDate(reminderDate.getDate() - daysBefore);
  const triggerDate = reminderDate > new Date() ? reminderDate : renewalDate;

  return await scheduleNotification({
    title: `Upcoming renewal: ${subscription.name}`,
    body: `${subscription.name} renews on ${subscription.next_renewal}.`,
    date: triggerDate,
  });
}

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
