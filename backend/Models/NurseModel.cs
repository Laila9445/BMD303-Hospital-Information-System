using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CLINICSYSTEM.Models
{
    /// <summary>
    /// Nurse profile model linked to UserModel via UserId
    /// </summary>
    public class NurseModel
    {
        [Key]
        public int NurseId { get; set; }
        
        public int UserId { get; set; }
        
        /// <summary>
        /// Navigation property to UserModel
        /// </summary>
        public UserModel? User { get; set; }
        
        /// <summary>
        /// Specialization area of the nurse
        /// </summary>
        public string? Specialization { get; set; }
        
        /// <summary>
        /// License/Certification number
        /// </summary>
        public string? LicenseNumber { get; set; }
        
        /// <summary>
        /// Date of hire
        /// </summary>
        public DateTime HireDate { get; set; }
        
        /// <summary>
        /// Department/Unit the nurse works in
        /// </summary>
        public string? Department { get; set; }
        
        /// <summary>
        /// Available hours/shifts
        /// </summary>
        public string? AvailableHours { get; set; }
        
        /// <summary>
        /// Patient care tasks assigned to this nurse
        /// </summary>
        public ICollection<PatientCareTaskModel>? CareTasks { get; set; } = new List<PatientCareTaskModel>();
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}
