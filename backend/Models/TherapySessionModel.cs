using System;
using System.ComponentModel.DataAnnotations;

namespace CLINICSYSTEM.Models
{
    /// <summary>
    /// Individual therapy session model
    /// </summary>
    public class TherapySessionModel
    {
        [Key]
        public int SessionId { get; set; }
        
        /// <summary>
        /// The therapy plan this session belongs to
        /// </summary>
        public int? TherapyPlanId { get; set; }
        
        /// <summary>
        /// Navigation property to TherapyPlanModel
        /// </summary>
        public TherapyPlanModel? TherapyPlan { get; set; }
        
        /// <summary>
        /// The referral this session is for
        /// </summary>
        public int ReferralId { get; set; }
        
        /// <summary>
        /// Navigation property to ReferralModel
        /// </summary>
        public ReferralModel? Referral { get; set; }
        
        /// <summary>
        /// Session date and time
        /// </summary>
        public DateTime SessionDateTime { get; set; }
        
        /// <summary>
        /// Duration in minutes
        /// </summary>
        public int DurationMinutes { get; set; }
        
        /// <summary>
        /// Status (Scheduled, Completed, Cancelled, No-Show)
        /// </summary>
        public string Status { get; set; } = "Scheduled";
        
        /// <summary>
        /// Therapist assigned to this session
        /// </summary>
        public string? TherapistName { get; set; }
        
        /// <summary>
        /// Session notes/progress
        /// </summary>
        public string? SessionNotes { get; set; }
        
        /// <summary>
        /// Exercises prescribed
        /// </summary>
        public string? ExercisesPrescribed { get; set; }
        
        /// <summary>
        /// Patient progress assessment
        /// </summary>
        public string? ProgressAssessment { get; set; }
        
        /// <summary>
        /// Recommendations for next session
        /// </summary>
        public string? Recommendations { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}
