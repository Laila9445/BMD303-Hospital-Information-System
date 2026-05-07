using System;
using System.ComponentModel.DataAnnotations;

namespace CLINICSYSTEM.Models
{
    /// <summary>
    /// Patient care task assigned to nurses for patient care management
    /// </summary>
    public class PatientCareTaskModel
    {
        [Key]
        public int TaskId { get; set; }
        
        /// <summary>
        /// External patient ID (reference to patient microservice)
        /// </summary>
        public string? PatientExternalId { get; set; }
        
        /// <summary>
        /// Internal patient ID (if available)
        /// </summary>
        public int? PatientId { get; set; }
        
        /// <summary>
        /// Navigation property to PatientModel
        /// </summary>
        public PatientModel? Patient { get; set; }
        
        /// <summary>
        /// The nurse assigned to this task
        /// </summary>
        public int NurseId { get; set; }
        
        /// <summary>
        /// Navigation property to NurseModel
        /// </summary>
        public NurseModel? Nurse { get; set; }
        
        /// <summary>
        /// Description of the care task
        /// </summary>
        public string? TaskDescription { get; set; }
        
        /// <summary>
        /// Type of task (e.g., Medication, Wound Care, Monitoring, etc.)
        /// </summary>
        public string? TaskType { get; set; }
        
        /// <summary>
        /// Status of the task (Pending, In Progress, Completed, Cancelled)
        /// </summary>
        public string Status { get; set; } = "Pending";
        
        /// <summary>
        /// When the task should be performed
        /// </summary>
        public DateTime ScheduledAt { get; set; }
        
        /// <summary>
        /// When the task was actually completed
        /// </summary>
        public DateTime? CompletedAt { get; set; }
        
        /// <summary>
        /// Notes about task completion
        /// </summary>
        public string? CompletionNotes { get; set; }
        
        /// <summary>
        /// Priority level (Low, Medium, High, Urgent)
        /// </summary>
        public string Priority { get; set; } = "Medium";
        
        /// <summary>
        /// Related appointment ID (if applicable)
        /// </summary>
        public int? AppointmentId { get; set; }
        
        /// <summary>
        /// Related consultation ID (if applicable)
        /// </summary>
        public int? ConsultationId { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}
