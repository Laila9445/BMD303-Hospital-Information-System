using System;
using System.Collections.Generic;
using Hl7.Fhir.Model;

namespace CLINICSYSTEM.Models.FHIR
{
    /// <summary>
    /// FHIR R4 ServiceRequest for Clinic System Referrals.
    /// Uses Firely HL7 FHIR SDK.
    /// </summary>
    public class FhirServiceRequest : ServiceRequest
    {
        public FhirServiceRequest()
        {
            // In FHIR R4, 'referral' is not a valid intent. 'Order' is typically used for referrals.
            Intent = RequestIntent.Order;
            Category = new List<CodeableConcept>();
            Performer = new List<ResourceReference>();
            ReasonCode = new List<CodeableConcept>();
        }
    }
}
