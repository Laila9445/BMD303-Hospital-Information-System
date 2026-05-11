namespace CLINICSYSTEM.Models.FHIR
{
    /// <summary>
    /// FHIR Practitioner Resource - Represents a doctor or healthcare provider
    /// Based on HL7 FHIR R4 standard: http://hl7.org/fhir/R4/practitioner.html
    /// </summary>
    public class FhirPractitioner
    {
        public string resourceType => "Practitioner";
        public string? id { get; set; }
        public List<FhirIdentifier>? identifier { get; set; }
        public bool active { get; set; } = true;
        public List<FhirHumanName>? name { get; set; }
        public List<FhirContactPoint>? telecom { get; set; }
        public string? gender { get; set; }
        public string? birthDate { get; set; }
        public List<FhirPractitionerQualification>? qualification { get; set; }
    }

    /// <summary>
    /// FHIR Practitioner Qualification
    /// </summary>
    public class FhirPractitionerQualification
    {
        public FhirCodeableConcept? code { get; set; }
        public string? period_start { get; set; }
        public string? period_end { get; set; }
        public FhirReference? issuer { get; set; }
    }

    /// <summary>
    /// FHIR Codeable Concept
    /// </summary>
    public class FhirCodeableConcept
    {
        public List<FhirCoding>? coding { get; set; }
        public string? text { get; set; }
    }

    /// <summary>
    /// FHIR Coding
    /// </summary>
    public class FhirCoding
    {
        public string? system { get; set; }
        public string? code { get; set; }
        public string? display { get; set; }
    }

    /// <summary>
    /// FHIR Reference to another resource
    /// </summary>
    public class FhirReference
    {
        public string? reference { get; set; }
        public string? display { get; set; }
    }
}
