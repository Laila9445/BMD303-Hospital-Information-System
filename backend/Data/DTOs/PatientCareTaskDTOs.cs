using System;

namespace CLINICSYSTEM.Data.DTOs
{
    /// <summary>
    /// DTO for Patient Care Task information
    /// </summary>
    public class PatientCareTaskDTO
    {
        public int TaskId { get; set; }
        public string? PatientExternalId { get; set; }
        public int? PatientId { get; set; }
        public int NurseId { get; set; }
        public string? TaskDescription { get; set; }
        public string? TaskType { get; set; }
        public string Status { get; set; } = "Pending";
        public DateTime ScheduledAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public string? CompletionNotes { get; set; }
        public string Priority { get; set; } = "Medium";
        public int? AppointmentId { get; set; }
        public int? ConsultationId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    /// <summary>
    /// DTO for creating a patient care task
    /// </summary>
    public class CreatePatientCareTaskRequest
    {
        public string? PatientExternalId { get; set; }
        public int? PatientId { get; set; }
        public int NurseId { get; set; }
        public string? TaskDescription { get; set; }
        public string? TaskType { get; set; }
        public DateTime ScheduledAt { get; set; }
        public string Priority { get; set; } = "Medium";
        public int? AppointmentId { get; set; }
        public int? ConsultationId { get; set; }
    }

    /// <summary>
    /// DTO for updating patient care task status
    /// </summary>
    public class UpdatePatientCareTaskStatusRequest
    {
        public string Status { get; set; } = "Pending";
        public string? CompletionNotes { get; set; }
    }
}
