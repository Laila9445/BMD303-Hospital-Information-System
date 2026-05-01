using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using CLINICSYSTEM.Data.DTOs;
using CLINICSYSTEM.Services;

namespace CLINICSYSTEM.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationService _notificationService;

        public NotificationsController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            return userIdClaim != null && int.TryParse(userIdClaim.Value, out var id) ? id : 0;
        }

        [HttpGet]
        public async Task<IActionResult> GetMyNotifications()
        {
            var userId = GetUserId();
            if (userId == 0) return Unauthorized();

            var notifications = await _notificationService.GetUserNotificationsAsync(userId);
            return Ok(notifications);
        }

        [HttpPut("{notificationId}/read")]
        public async Task<IActionResult> MarkAsRead([FromRoute] int notificationId)
        {
            var result = await _notificationService.MarkAsReadAsync(notificationId);
            if (!result) return NotFound();

            return Ok(new { message = "Notification marked as read" });
        }

        [HttpDelete("{notificationId}")]
        public async Task<IActionResult> DeleteNotification([FromRoute] int notificationId)
        {
            var result = await _notificationService.DeleteNotificationAsync(notificationId);
            if (!result) return NotFound();

            return Ok(new { message = "Notification deleted" });
        }

        [Authorize(Roles = "Doctor")]
        [HttpPost("appointment-reminder/{appointmentId}")]
        public async Task<IActionResult> SendAppointmentReminder([FromRoute] int appointmentId)
        {
            await _notificationService.SendAppointmentReminderAsync(appointmentId);
            return Ok(new { message = "Reminder sent" });
        }
    }
}
