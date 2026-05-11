namespace CLINICSYSTEM.Data.DTOs.FHIR
{
    /// <summary>
    /// FHIR Bundle for returning multiple resources
    /// Based on HL7 FHIR R4 Bundle standard
    /// </summary>
    public class FhirBundle<T>
    {
        public string resourceType => "Bundle";
        public string type { get; set; } = "searchset"; // searchset, collection, transaction
        public int? total { get; set; }
        public List<FhirBundleEntry<T>>? entry { get; set; }
    }

    /// <summary>
    /// FHIR Bundle Entry
    /// </summary>
    public class FhirBundleEntry<T>
    {
        public T? resource { get; set; }
        public string? fullUrl { get; set; }
    }

    /// <summary>
    /// FHIR Operation Outcome - Standard error response
    /// </summary>
    public class FhirOperationOutcome
    {
        public string resourceType => "OperationOutcome";
        public List<FhirIssue> issue { get; set; } = new();
    }

    /// <summary>
    /// FHIR Issue
    /// </summary>
    public class FhirIssue
    {
        public string severity { get; set; } = "error"; // fatal, error, warning, information
        public string code { get; set; } = "processing"; // invalid, required, forbidden, not-found, not-supported, duplicate, multiple-matches, too-long, business-rule, conflict, exception, timeout, throttled, transient, incomplete, lock-error, no-store, format-unsupported, structure-error, processing
        public string? details_text { get; set; }
        public string? diagnostics { get; set; }
    }

    /// <summary>
    /// FHIR Capability Statement - Describes FHIR server capabilities
    /// </summary>
    public class FhirCapabilityStatement
    {
        public string resourceType => "CapabilityStatement";
        public string? status => "active";
        public string? date { get; set; }
        public string? publisher { get; set; }
        public string? kind => "instance";
        public string? software_name { get; set; }
        public string? software_version { get; set; }
        public string? fhirVersion => "4.0.1";
        public string format => "json";
        public List<FhirRestResource>? rest { get; set; }
    }

    /// <summary>
    /// FHIR REST Resource capability
    /// </summary>
    public class FhirRestResource
    {
        public string type { get; set; } = "";
        public List<string>? interaction { get; set; }
        public List<string>? searchParam { get; set; }
    }
}
