namespace CLINICSYSTEM.Models.FHIR
{
    /// <summary>
    /// FHIR Condition Resource - Represents diagnosis or medical condition
    /// Based on HL7 FHIR R4 standard: http://hl7.org/fhir/R4/condition.html
    /// </summary>
    public class FhirCondition
    {
        public string resourceType => "Condition";
        public string? id { get; set; }
        public List<FhirIdentifier>? identifier { get; set; }
        public string? clinicalStatus { get; set; } // active, recurrence, relapse, inactive, remission, resolved
        public string? verificationStatus { get; set; } // unconfirmed, provisional, differential, confirmed, refuted, entered-in-error
        public FhirCodeableConcept? category { get; set; }
        public FhirCodeableConcept? severity { get; set; }
        public FhirCodeableConcept? code { get; set; }
        public FhirReference? subject { get; set; } // Reference to Patient
        public FhirReference? encounter { get; set; } // Reference to Encounter/Consultation
        public string? onsetDateTime { get; set; }
        public string? recordedDate { get; set; }
        public FhirReference? recorder { get; set; } // Reference to Practitioner
        public string? note { get; set; }
    }
}
