using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CLINICSYSTEM.Models
{
    /// <summary>
    /// Therapy plan model for physiotherapy integration
    /// </summary>
    public class TherapyPlanModel
    {
        [Key]
        public int TherapyPlanId { get; set; }
        
        /// <summary>
        /// The referral this therapy plan is for
        /// </summary>
        public int ReferralId { get; set; }
        
        /// <summary>
        /// Navigation property to ReferralModel
        /// </summary>
        public ReferralModel? Referral { get; set; }
        
        /// <summary>
        /// Plan name/description
        /// </summary>
        public string PlanName { get; set; } = null!;
        
        /// <summary>
        /// Type of therapy (Physical, Occupational, Speech, etc.)
        /// </summary>
        public string TherapyType { get; set; } = null!;
        
        /// <summary>
        /// Treatment goals
        /// </summary>
        public string? Goals { get; set; }
        
        /// <summary>
        /// Duration in weeks
        /// </summary>
        public int DurationWeeks { get; set; }
        
        /// <summary>
        /// Number of sessions per week
        /// </summary>
        public int SessionsPerWeek { get; set; }
        
        /// <summary>
        /// Start date of therapy
        /// </summary>
        public DateTime StartDate { get; set; }
        
        /// <summary>
        /// Estimated end date
        /// </summary>
        public DateTime? EstimatedEndDate { get; set; }
        
        /// <summary>
        /// Status (Active, Completed, Suspended, Cancelled)
        /// </summary>
        public string Status { get; set; } = "Active";
        
        /// <summary>
        /// Special precautions or notes
        /// </summary>
        public string? Precautions { get; set; }
        
        /// <summary>
        /// Sessions part of this plan
        /// </summary>
        public ICollection<TherapySessionModel>? Sessions { get; set; } = new List<TherapySessionModel>();
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}
