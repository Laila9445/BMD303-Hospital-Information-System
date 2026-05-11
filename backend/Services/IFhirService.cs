using CLINICSYSTEM.Models.FHIR;

namespace CLINICSYSTEM.Services
{
    /// <summary>
    /// FHIR Service Interface - Transforms internal data to FHIR R4 compliant resources
    /// Enables interoperability with external healthcare systems (e.g., Physiotherapy Clinic)
    /// </summary>
    public interface IFhirService
    {
        // Patient Resources
        Task<FhirPatient?> GetPatientByIdAsync(string patientExternalId);
        Task<List<FhirPatient>> SearchPatientsAsync(string? name = null, string? identifier = null);

        // Practitioner Resources
        Task<FhirPractitioner?> GetPractitionerByIdAsync(int doctorId);
        Task<List<FhirPractitioner>> SearchPractitionersAsync(string? name = null, string? specialization = null);

        // Condition (Diagnosis) Resources
        Task<FhirCondition?> GetConditionByConsultationIdAsync(int consultationId);
        Task<List<FhirCondition>> GetConditionsByPatientAsync(string patientExternalId);

        // CarePlan (Therapy Plan) Resources
        Task<FhirCarePlan?> GetCarePlanByIdAsync(int therapyPlanId);
        Task<List<FhirCarePlan>> GetCarePlansByPatientAsync(string patientExternalId, string? status = null);
        Task<List<FhirCarePlan>> GetCarePlansByReferralAsync(int referralId);

        // ServiceRequest (Referral) Resources
        Task<FhirServiceRequest?> GetServiceRequestByIdAsync(int referralId);
        Task<List<FhirServiceRequest>> GetServiceRequestsByPatientAsync(string patientExternalId, string? status = null);
        Task<List<FhirServiceRequest>> GetServiceRequestsByPractitionerAsync(int doctorId, string? status = null);

        // Appointment Resources
        Task<FhirAppointment?> GetAppointmentByIdAsync(int appointmentId);
        Task<List<FhirAppointment>> GetAppointmentsByPatientAsync(string patientExternalId, DateTime? dateFrom = null, DateTime? dateTo = null);
        Task<List<FhirAppointment>> GetAppointmentsByPractitionerAsync(int doctorId, DateTime? dateFrom = null, DateTime? dateTo = null);

        // Observation Resources (Clinical measurements)
        Task<List<FhirObservation>> GetObservationsByPatientAsync(string patientExternalId, string? category = null);
        Task<List<FhirObservation>> GetObservationsByEncounterAsync(int consultationId);
    }
}
