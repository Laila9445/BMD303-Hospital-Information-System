namespace CLINICSYSTEM.Models.FHIR
{
    /// <summary>
    /// FHIR Appointment Resource - Represents scheduled appointment
    /// Based on HL7 FHIR R4 standard: http://hl7.org/fhir/R4/appointment.html
    /// </summary>
    public class FhirAppointment
    {
        public string resourceType => "Appointment";
        public string? id { get; set; }
        public List<FhirIdentifier>? identifier { get; set; }
        public string? status { get; set; } // proposed, pending, booked, arrived, fulfilled, cancelled, noshow, entered-in-error, checked-in, waitlist
        public FhirCodeableConcept? serviceCategory { get; set; }
        public FhirCodeableConcept? serviceType { get; set; }
        public string? description { get; set; }
        public string? start { get; set; } // ISO 8601 datetime
        public string? end { get; set; } // ISO 8601 datetime
        public int? minutesDuration { get; set; }
        public DateTime? created { get; set; }
        public string? createdElement { get; set; }
        public List<FhirAppointmentParticipant>? participant { get; set; }
        public string? comment { get; set; }
    }

    /// <summary>
    /// FHIR Appointment Participant
    /// </summary>
    public class FhirAppointmentParticipant
    {
        public string? type { get; set; } // actor, patient, practitioner, related, device
        public FhirReference? actor { get; set; } // Reference to Patient or Practitioner
        public string? status { get; set; } // accepted, declined, tentative, needs-action
        public bool? required { get; set; } // required, optional, information-only
    }
}
