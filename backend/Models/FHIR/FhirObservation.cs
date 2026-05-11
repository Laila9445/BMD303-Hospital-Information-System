namespace CLINICSYSTEM.Models.FHIR
{
    /// <summary>
    /// FHIR Observation Resource - Represents clinical observations, measurements, or assessments
    /// Based on HL7 FHIR R4 standard: http://hl7.org/fhir/R4/observation.html
    /// Useful for physiotherapy: range of motion, pain scale, strength measurements, etc.
    /// </summary>
    public class FhirObservation
    {
        public string resourceType => "Observation";
        public string? id { get; set; }
        public List<FhirIdentifier>? identifier { get; set; }
        public string? status { get; set; } // registered, preliminary, final, amended, corrected, cancelled, entered-in-error, unknown
        public FhirCodeableConcept? category { get; set; } // vital-signs, imaging, laboratory, survey, therapy, procedure, activity
        public FhirCodeableConcept? code { get; set; }
        public FhirReference? subject { get; set; } // Reference to Patient
        public string? effectiveDateTime { get; set; }
        public DateTime? issued { get; set; }
        public FhirReference? performer { get; set; } // Reference to Practitioner
        public FhirObservationValue? valueQuantity { get; set; }
        public string? valueString { get; set; }
        public FhirCodeableConcept? valueCodeableConcept { get; set; }
        public string? note { get; set; }
        public FhirReference? encounter { get; set; } // Reference to Encounter/Consultation
    }

    /// <summary>
    /// FHIR Observation Value (Quantity)
    /// </summary>
    public class FhirObservationValue
    {
        public decimal? value { get; set; }
        public string? unit { get; set; }
        public string? system { get; set; }
        public string? code { get; set; }
    }
}
