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
        public static FhirServiceRequest ToFhirServiceRequest(ReferralModel referral)
        {
            var fhirRequest = new FhirServiceRequest
            {
                Id = referral.FhirServiceRequestId?.Replace("ServiceRequest/", ""),
                Status = MapStatusToFhir(referral.Status),
                Intent = RequestIntent.Order,
                Subject = new ResourceReference($"Patient/{referral.PatientExternalId}", referral.PatientName),
                Requester = new ResourceReference($"Practitioner/{referral.DoctorId}", referral.DoctorName),
                AuthoredOn = referral.CreatedDate.ToString("o"),
                Priority = MapUrgencyToFhir(referral.Urgency),
                Code = new CodeableConcept { Text = referral.ReferralType }
            };

            if (!string.IsNullOrEmpty(referral.Reason))
            {
                fhirRequest.ReasonCode.Add(new CodeableConcept { Text = referral.Reason });
            }

            if (!string.IsNullOrEmpty(referral.Notes))
            {
                fhirRequest.Note.Add(new Annotation { Text = new Markdown(referral.Notes) });
            }

            return fhirRequest;
        }

        /// <summary>
        /// Converts an internal ReferralDTO to a FHIR ServiceRequest.
        /// </summary>
        public static FhirServiceRequest ToFhirServiceRequest(ReferralDTO referral)
        {
            var fhirRequest = new FhirServiceRequest
            {
                Id = referral.ReferralId.ToString(),
                Status = MapStatusToFhir(referral.Status),
                Intent = RequestIntent.Order,
                Subject = new ResourceReference($"Patient/{referral.PatientExternalId}", referral.PatientName),
                Requester = new ResourceReference($"Practitioner/{referral.DoctorId}", referral.DoctorName),
                AuthoredOn = referral.CreatedDate.ToString("o"),
                Priority = MapUrgencyToFhir(referral.Urgency),
                Code = new CodeableConcept { Text = referral.ReferralType }
            };

            if (!string.IsNullOrEmpty(referral.Reason))
            {
                fhirRequest.ReasonCode.Add(new CodeableConcept { Text = referral.Reason });
            }

            if (!string.IsNullOrEmpty(referral.Notes))
            {
                fhirRequest.Note.Add(new Annotation { Text = new Markdown(referral.Notes) });
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
                FhirServiceRequestId = $"ServiceRequest/{fhir.Id}",
                CreatedDate = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            if (int.TryParse(fhir.Id, out int id))
            {
                // This is a fallback, but FhirServiceRequestId is the primary identifier
            }

            referral.Status = MapStatusFromFhir(fhir.Status);
            referral.Urgency = MapUrgencyFromFhir(fhir.Priority) ?? "Routine";

            if (fhir.Subject?.Reference != null && fhir.Subject.Reference.StartsWith("Patient/"))
            {
                referral.PatientExternalId = fhir.Subject.Reference.Substring("Patient/".Length);
                referral.PatientName = fhir.Subject.Display;
            }

            if (fhir.Requester?.Reference != null && fhir.Requester.Reference.StartsWith("Practitioner/"))
            {
                var docIdStr = fhir.Requester.Reference.Substring("Practitioner/".Length);
                if (int.TryParse(docIdStr, out int docId))
                {
                    referral.DoctorId = docId;
                    referral.DoctorName = fhir.Requester.Display;
                }
            }

            referral.ReferralType = fhir.Code?.Text;

            var reason = fhir.ReasonCode?.FirstOrDefault()?.Text;
            if (!string.IsNullOrEmpty(reason))
            {
                referral.Reason = reason;
            }

            var note = fhir.Note?.FirstOrDefault()?.Text;
            if (!string.IsNullOrEmpty(note))
            {
                referral.Notes = note;
            }

            return referral;
        }

        private static RequestStatus MapStatusToFhir(string status)
        {
            return status?.ToLower() switch
            {
                "pending" => RequestStatus.Draft,
                "accepted" => RequestStatus.Active,
                "appointment booked" => RequestStatus.Active,
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
                RequestStatus.Active => "Accepted",
                RequestStatus.OnHold => "Pending",
                RequestStatus.Revoked => "Cancelled",
                RequestStatus.Completed => "Completed",
                RequestStatus.EnteredInError => "Cancelled",
                _ => "Pending"
            };
        }

        private static RequestPriority MapUrgencyToFhir(string urgency)
        {
            return urgency?.ToLower() switch
            {
                "routine" => RequestPriority.Routine,
                "urgent" => RequestPriority.Urgent,
                "emergency" => RequestPriority.Stat,
                _ => RequestPriority.Routine,
            };
        }

        private static string MapUrgencyFromFhir(RequestPriority? priority)
        {
            return priority switch
            {
                RequestPriority.Routine => "Routine",
                RequestPriority.Urgent => "Urgent",
                RequestPriority.Asap => "Urgent",
                RequestPriority.Stat => "Emergency",
                _ => "Routine",
            };
        }
    }
}
