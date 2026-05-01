using CLINICSYSTEM.Data.DTOs;

namespace CLINICSYSTEM.Services
{
    public interface INotificationService
    {
        Task<NotificationDTO?> CreateNotificationAsync(int userId, CreateNotificationRequest request);
        Task<List<NotificationDTO>> GetUserNotificationsAsync(int userId);
        Task<bool> MarkAsReadAsync(int notificationId);
        Task<bool> DeleteNotificationAsync(int notificationId);
        Task SendAppointmentReminderAsync(int appointmentId);
    }
}
