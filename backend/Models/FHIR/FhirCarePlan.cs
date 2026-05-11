namespace CLINICSYSTEM.Models.FHIR
{
    /// <summary>
    /// FHIR CarePlan Resource - Represents therapy plan or treatment plan
    /// Based on HL7 FHIR R4 standard: http://hl7.org/fhir/R4/careplan.html
    /// </summary>
    public class FhirCarePlan
    {
        public string resourceType => "CarePlan";
        public string? id { get; set; }
        public List<FhirIdentifier>? identifier { get; set; }
        public string? status { get; set; } // draft, active, on-hold, revoked, completed, entered-in-error, unknown
        public string? intent { get; set; } // proposal, plan, order, option
        public FhirCodeableConcept? category { get; set; }
        public string? title { get; set; }
        public string? description { get; set; }
        public FhirReference? subject { get; set; } // Reference to Patient
        public string? period_start { get; set; }
        public string? period_end { get; set; }
        public DateTime? created { get; set; }
        public FhirReference? author { get; set; } // Reference to Practitioner
        public List<FhirReference>? addresses { get; set; } // References to Conditions
        public List<FhirCarePlanActivity>? activity { get; set; }
        public string? note { get; set; }
    }

    /// <summary>
    /// FHIR CarePlan Activity
    /// </summary>
    public class FhirCarePlanActivity
    {
        public string? outcome { get; set; }
        public FhirCodeableConcept? progress { get; set; }
        public FhirCarePlanActivityDetail? detail { get; set; }
    }

    /// <summary>
    /// FHIR CarePlan Activity Detail
    /// </summary>
    public class FhirCarePlanActivityDetail
    {
        public string? status { get; set; } // not-started, scheduled, in-progress, on-hold, completed, cancelled, stopped, unknown, entered-in-error
        public FhirCodeableConcept? category { get; set; }
        public FhirCodeableConcept? code { get; set; }
        public string? description { get; set; }
        public DateTime? scheduled_start { get; set; }
        public DateTime? scheduled_end { get; set; }
        public FhirReference? performer { get; set; }
    }
}
