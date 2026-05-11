namespace CLINICSYSTEM.Models.FHIR
{
    /// <summary>
    /// FHIR Patient Resource - Represents a patient receiving care
    /// Based on HL7 FHIR R4 standard: http://hl7.org/fhir/R4/patient.html
    /// </summary>
    public class FhirPatient
    {
        public string resourceType => "Patient";
        public string? id { get; set; }
        public List<FhirIdentifier>? identifier { get; set; }
        public bool active { get; set; } = true;
        public List<FhirHumanName>? name { get; set; }
        public List<FhirContactPoint>? telecom { get; set; }
        public string? gender { get; set; } // male, female, other, unknown
        public string? birthDate { get; set; } // YYYY-MM-DD
        public FhirAddress? address { get; set; }
        public string? meta { get; set; }
        public DateTime? meta_lastUpdated { get; set; }
    }

    /// <summary>
    /// FHIR Identifier
    /// </summary>
    public class FhirIdentifier
    {
        public string? system { get; set; }
        public string? value { get; set; }
        public string? use { get; set; } // usual, official, temp, secondary
        public string? type { get; set; }
    }

    /// <summary>
    /// FHIR Human Name
    /// </summary>
    public class FhirHumanName
    {
        public string? use { get; set; } // usual, official, temp, nickname
        public string? family { get; set; }
        public List<string>? given { get; set; }
        public string? text { get; set; }
    }

    /// <summary>
    /// FHIR Contact Point (phone, email, etc.)
    /// </summary>
    public class FhirContactPoint
    {
        public string? system { get; set; } // phone, fax, email, sms, url
        public string? value { get; set; }
        public string? use { get; set; } // home, work, temp, old, mobile
        public int? rank { get; set; }
    }

    /// <summary>
    /// FHIR Address
    /// </summary>
    public class FhirAddress
    {
        public string? use { get; set; } // home, work, temp, old
        public string? text { get; set; }
        public List<string>? line { get; set; }
        public string? city { get; set; }
        public string? state { get; set; }
        public string? postalCode { get; set; }
        public string? country { get; set; }
    }
}
