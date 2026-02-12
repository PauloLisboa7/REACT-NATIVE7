import * as Notifications from 'expo-notifications';

// Configurar como as notificações devem se comportar
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

/**
 * Solicita permissão para enviar notificações
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Erro ao solicitar permissão de notificação:', error);
    return false;
  }
};

/**
 * Envia uma notificação local
 */
export const sendLocalNotification = async (payload: NotificationPayload): Promise<void> => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: payload.title,
        body: payload.body,
        data: payload.data || {},
      },
      trigger: null, // Enviar imediatamente
    });
  } catch (error) {
    console.error('Erro ao enviar notificação:', error);
  }
};

/**
 * Envia uma notificação agendada
 */
export const scheduleNotification = async (
  payload: NotificationPayload,
  delaySeconds: number
): Promise<void> => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: payload.title,
        body: payload.body,
        data: payload.data || {},
      },
      trigger: { seconds: delaySeconds },
    });
  } catch (error) {
    console.error('Erro ao agendar notificação:', error);
  }
};

/**
 * Cancela uma notificação agendada
 */
export const cancelNotification = async (notificationId: string): Promise<void> => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('Erro ao cancelar notificação:', error);
  }
};
