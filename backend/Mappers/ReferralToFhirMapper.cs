using System;
using System.Collections.Generic;
using System.Linq;
using CLINICSYSTEM.Models;
using CLINICSYSTEM.Models.FHIR;
using CLINICSYSTEM.Data.DTOs;
using Hl7.Fhir.Model;

namespace CLINICSYSTEM.Mappers
{
    /// <summary>
    /// Maps between internal ReferralModel and FHIR R4 ServiceRequest.
    /// </summary>
    public static class ReferralToFhirMapper
    {
        private const string SNOMED_SYSTEM = "http://snomed.info/sct";

        /// <summary>
        /// Converts an internal ReferralModel to a FHIR ServiceRequest.
        /// </summary>
        public static FhirServiceRequest ToFhirServiceRequest(ReferralDTO referral)
        {
            var fhirRequest = new FhirServiceRequest
            {
                Id = referral.ReferralId.ToString(),
                Status = MapStatusToFhir(referral.Status),
                Subject = new ResourceReference($"Patient/{referral.PatientExternalId}"),
                Requester = new ResourceReference($"Practitioner/{referral.DoctorId}"),
                AuthoredOn = referral.CreatedAt.ToString("o"),
                Priority = MapPriorityToFhir(referral.Priority),
                Code = new CodeableConcept("", "", referral.RecommendedTreatment) // Optional, using code for treatment or type
            };

            // Category based on ReferralType
            var snomedCode = GetSnomedCodeForType(referral.ReferralType);
            if (snomedCode != null)
            {
                fhirRequest.Category.Add(new CodeableConcept(SNOMED_SYSTEM, snomedCode.Value.Code, snomedCode.Value.Display));
            }

            // ReasonCode based on Reason and Diagnosis
            if (!string.IsNullOrEmpty(referral.Reason) || !string.IsNullOrEmpty(referral.Diagnosis))
            {
                var reasonText = $"{referral.Reason} - {referral.Diagnosis}".Trim(' ', '-');
                fhirRequest.ReasonCode.Add(new CodeableConcept("", "", reasonText));
            }

            // External service mapping
            if (!string.IsNullOrEmpty(referral.ExternalServiceUrl))
            {
                fhirRequest.Performer.Add(new ResourceReference($"Organization/{referral.ExternalServiceUrl}"));
            }

            return fhirRequest;
        }

        /// <summary>
        /// Converts an internal ReferralModel to a FHIR ServiceRequest.
        /// </summary>
        public static FhirServiceRequest ToFhirServiceRequest(ReferralModel referral)
        {
            var fhirRequest = new FhirServiceRequest
            {
                Id = referral.ReferralId.ToString(),
                Status = MapStatusToFhir(referral.Status),
                Subject = new ResourceReference($"Patient/{referral.PatientExternalId}"),
                Requester = new ResourceReference($"Practitioner/{referral.DoctorId}"),
                AuthoredOn = referral.CreatedAt.ToString("o"),
                Priority = MapPriorityToFhir(referral.Priority),
                Code = new CodeableConcept("", "", referral.RecommendedTreatment) // Optional, using code for treatment or type
            };

            // Category based on ReferralType
            var snomedCode = GetSnomedCodeForType(referral.ReferralType);
            if (snomedCode != null)
            {
                fhirRequest.Category.Add(new CodeableConcept(SNOMED_SYSTEM, snomedCode.Value.Code, snomedCode.Value.Display));
            }

            // ReasonCode based on Reason and Diagnosis
            if (!string.IsNullOrEmpty(referral.Reason) || !string.IsNullOrEmpty(referral.Diagnosis))
            {
                var reasonText = $"{referral.Reason} - {referral.Diagnosis}".Trim(' ', '-');
                fhirRequest.ReasonCode.Add(new CodeableConcept("", "", reasonText));
            }

            // External service mapping
            if (!string.IsNullOrEmpty(referral.ExternalServiceUrl))
            {
                fhirRequest.Performer.Add(new ResourceReference($"Organization/{referral.ExternalServiceUrl}"));
            }

            return fhirRequest;
        }

        /// <summary>
        /// Converts a FHIR ServiceRequest to an internal ReferralModel.
        /// </summary>
        public static ReferralModel FromFhirServiceRequest(FhirServiceRequest fhir)
        {
            var referral = new ReferralModel
            {
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            if (int.TryParse(fhir.Id, out int id))
            {
                referral.ReferralId = id;
            }

            referral.Status = MapStatusFromFhir(fhir.Status);
            referral.Priority = MapPriorityFromFhir(fhir.Priority) ?? "Normal";

            if (fhir.Subject?.Reference != null && fhir.Subject.Reference.StartsWith("Patient/"))
            {
                referral.PatientExternalId = fhir.Subject.Reference.Substring("Patient/".Length);
            }

            if (fhir.Requester?.Reference != null && fhir.Requester.Reference.StartsWith("Practitioner/"))
            {
                var docIdStr = fhir.Requester.Reference.Substring("Practitioner/".Length);
                if (int.TryParse(docIdStr, out int docId))
                {
                    referral.DoctorId = docId;
                }
            }

            var category = fhir.Category?.FirstOrDefault()?.Coding?.FirstOrDefault();
            if (category != null && category.System == SNOMED_SYSTEM)
            {
                referral.ReferralType = GetTypeForSnomedCode(category.Code) ?? "Unknown";
            }

            var reason = fhir.ReasonCode?.FirstOrDefault()?.Text;
            if (!string.IsNullOrEmpty(reason))
            {
                referral.Reason = reason;
                referral.Diagnosis = reason; // Basic fallback mapping
            }

            if (fhir.Code?.Text != null)
            {
                referral.RecommendedTreatment = fhir.Code.Text;
            }

            var performer = fhir.Performer?.FirstOrDefault()?.Reference;
            if (performer != null && performer.StartsWith("Organization/"))
            {
                referral.ExternalServiceUrl = performer.Substring("Organization/".Length);
            }

            return referral;
        }

        private static RequestStatus MapStatusToFhir(string status)
        {
            return status?.ToLower() switch
            {
                "pending" => RequestStatus.Draft,
                "sent" => RequestStatus.Active,
                "accepted" => RequestStatus.Active,
                "inprogress" => RequestStatus.Active,
                "completed" => RequestStatus.Completed,
                "cancelled" => RequestStatus.Revoked,
                _ => RequestStatus.Draft,
            };
        }

        private static string MapStatusFromFhir(RequestStatus? status)
        {
            return status switch
            {
                RequestStatus.Draft => "Pending",
                RequestStatus.Active => "Sent",
                RequestStatus.OnHold => "Pending",
                RequestStatus.Revoked => "Cancelled",
                RequestStatus.Completed => "Completed",
                RequestStatus.EnteredInError => "Cancelled",
                _ => "Pending"
            };
        }

        private static RequestPriority MapPriorityToFhir(string priority)
        {
            return priority?.ToLower() switch
            {
                "low" => RequestPriority.Routine,
                "normal" => RequestPriority.Routine,
                "high" => RequestPriority.Urgent,
                "urgent" => RequestPriority.Stat,
                _ => RequestPriority.Routine,
            };
        }

        private static string MapPriorityFromFhir(RequestPriority? priority)
        {
            return priority switch
            {
                RequestPriority.Routine => "Normal",
                RequestPriority.Urgent => "High",
                RequestPriority.Asap => "Urgent",
                RequestPriority.Stat => "Urgent",
                _ => "Normal"
            };
        }

        private static (string Code, string Display)? GetSnomedCodeForType(string referralType)
        {
            return referralType?.ToLowerInvariant() switch
            {
                "physiotherapy" => ("306206005", "Referral to physiotherapy service"),
                "radiology" => ("306241000", "Referral to radiology"),
                "billing" => ("182837000", "Referral to financial services"),
                _ => null
            };
        }

        private static string GetTypeForSnomedCode(string snomedCode)
        {
            return snomedCode switch
            {
                "306206005" => "Physiotherapy",
                "306241000" => "Radiology",
                "182837000" => "Billing",
                _ => "Unknown"
            };
        }
    }
}
