import apiClient from './apiClient';

const notificationService = {
  // Get user notifications
  getMyNotifications: async () => {
    const response = await apiClient.get('/api/Notifications');
    return response.data;
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    const response = await apiClient.put(`/api/Notifications/${notificationId}/read`);
    return response.data;
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    const response = await apiClient.delete(`/api/Notifications/${notificationId}`);
    return response.data;
  },

  // Send appointment reminder
  sendAppointmentReminder: async (appointmentId) => {
    const response = await apiClient.post(`/api/Notifications/appointment-reminder/${appointmentId}`);
    return response.data;
  },
};

export default notificationService;
