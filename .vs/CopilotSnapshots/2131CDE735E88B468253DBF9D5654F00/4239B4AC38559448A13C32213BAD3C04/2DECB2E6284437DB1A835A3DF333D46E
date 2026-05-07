using System.ComponentModel.DataAnnotations;

namespace CLINICSYSTEM.Models
{
    public class AppointmentModel
    {
        [Key]
        public int AppointmentId { get; set; }
        public int DoctorId { get; set; }
        
        /// <summary>
        /// Internal patient ID - kept for backward compatibility
        /// Will be phased out when fully migrated to external patient system
        /// </summary>
        public int? PatientId { get; set; }
        
        /// <summary>
        /// External patient ID from the Patient Portal system
        /// This will be the primary patient identifier in the integrated hospital system
        /// </summary>
        public string? PatientExternalId { get; set; }
        
        public int TimeSlotId { get; set; }
        public string Status { get; set; } = "Scheduled"; // Scheduled, Active, Completed, Cancelled
        public string? ReasonForVisit { get; set; }
        public DateTime BookedAt { get; set; }
        public DateTime? CanceledAt { get; set; }
        public string? CancellationReason { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public DoctorModel? Doctor { get; set; }
        
        /// <summary>
        /// Optional - kept for backward compatibility
        /// </summary>
        public PatientModel? Patient { get; set; }
        
        public TimeSlotModel? TimeSlot { get; set; }
        public ConsultationModel? Consultation { get; set; }
    }
}
