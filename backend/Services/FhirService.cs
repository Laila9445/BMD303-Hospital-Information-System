using Microsoft.EntityFrameworkCore;
using CLINICSYSTEM.Data;
using CLINICSYSTEM.Models;
using CLINICSYSTEM.Models.FHIR;

namespace CLINICSYSTEM.Services
{
    /// <summary>
    /// FHIR Service Implementation - Transforms internal clinic data to FHIR R4 resources
    /// Enables seamless integration with external healthcare systems using HL7 FHIR standards
    /// </summary>
    public class FhirService : IFhirService
    {
        private readonly ClinicDbContext _context;
        private readonly ILogger<FhirService> _logger;
        private const string FHIR_BASE_URL = "https://api.clinic-system.com/fhir";
        private const string PATIENT_IDENTIFIER_SYSTEM = "https://clinic-system.com/patient-id";
        private const string PRACTITIONER_IDENTIFIER_SYSTEM = "https://clinic-system.com/practitioner-id";

        public FhirService(ClinicDbContext context, ILogger<FhirService> logger)
        {
            _context = context;
            _logger = logger;
        }

        #region Patient Resources

        public async Task<FhirPatient?> GetPatientByIdAsync(string patientExternalId)
        {
            try
            {
                var patient = await _context.Patients
                    .FirstOrDefaultAsync(p => p.ExternalPatientId == patientExternalId);

                if (patient == null)
                    return null;

                return MapToFhirPatient(patient);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving FHIR Patient: {PatientId}", patientExternalId);
                return null;
            }
        }

        public async Task<List<FhirPatient>> SearchPatientsAsync(string? name = null, string? identifier = null)
        {
            try
            {
                var query = _context.Patients.AsQueryable();

                if (!string.IsNullOrWhiteSpace(name))
                {
                    query = query.Where(p => p.FullName.Contains(name));
                }

                if (!string.IsNullOrWhiteSpace(identifier))
                {
                    query = query.Where(p => p.ExternalPatientId == identifier);
                }

                var patients = await query.ToListAsync();
                return patients.Select(MapToFhirPatient).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching FHIR Patients");
                return new List<FhirPatient>();
            }
        }

        #endregion

        #region Practitioner Resources

        public async Task<FhirPractitioner?> GetPractitionerByIdAsync(int doctorId)
        {
            try
            {
                var doctor = await _context.Doctors
                    .Include(d => d.User)
                    .FirstOrDefaultAsync(d => d.DoctorId == doctorId);

                if (doctor == null)
                    return null;

                return MapToFhirPractitioner(doctor);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving FHIR Practitioner: {DoctorId}", doctorId);
                return null;
            }
        }

        public async Task<List<FhirPractitioner>> SearchPractitionersAsync(string? name = null, string? specialization = null)
        {
            try
            {
                var query = _context.Doctors
                    .Include(d => d.User)
                    .AsQueryable();

                if (!string.IsNullOrWhiteSpace(name))
                {
                    query = query.Where(d => 
                        d.User!.FirstName.Contains(name) || 
                        d.User!.LastName.Contains(name));
                }

                if (!string.IsNullOrWhiteSpace(specialization))
                {
                    query = query.Where(d => d.Specialization.Contains(specialization));
                }

                var doctors = await query.ToListAsync();
                return doctors.Select(MapToFhirPractitioner).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching FHIR Practitioners");
                return new List<FhirPractitioner>();
            }
        }

        #endregion

        #region Condition (Diagnosis) Resources

        public async Task<FhirCondition?> GetConditionByConsultationIdAsync(int consultationId)
        {
            try
            {
                var consultation = await _context.Consultations
                    .FirstOrDefaultAsync(c => c.ConsultationId == consultationId);

                if (consultation == null || string.IsNullOrEmpty(consultation.Diagnosis))
                    return null;

                return MapToFhirCondition(consultation);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving FHIR Condition for consultation: {ConsultationId}", consultationId);
                return null;
            }
        }

        public async Task<List<FhirCondition>> GetConditionsByPatientAsync(string patientExternalId)
        {
            try
            {
                var consultations = await _context.Consultations
                    .Include(c => c.Appointment)
                    .Where(c => c.Appointment != null && c.Appointment.PatientExternalId == patientExternalId)
                    .Where(c => !string.IsNullOrEmpty(c.Diagnosis))
                    .OrderByDescending(c => c.ConsultationDate)
                    .ToListAsync();

                return consultations.Select(MapToFhirCondition).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving FHIR Conditions for patient: {PatientId}", patientExternalId);
                return new List<FhirCondition>();
            }
        }

        #endregion

        #region CarePlan (Therapy Plan) Resources

        public async Task<FhirCarePlan?> GetCarePlanByIdAsync(int therapyPlanId)
        {
            try
            {
                var therapyPlan = await _context.TherapyPlans
                    .Include(tp => tp.Referral)
                    .FirstOrDefaultAsync(tp => tp.TherapyPlanId == therapyPlanId);

                if (therapyPlan == null)
                    return null;

                return MapToFhirCarePlan(therapyPlan);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving FHIR CarePlan: {TherapyPlanId}", therapyPlanId);
                return null;
            }
        }

        public async Task<List<FhirCarePlan>> GetCarePlansByPatientAsync(string patientExternalId, string? status = null)
        {
            try
            {
                var query = _context.TherapyPlans
                    .Include(tp => tp.Referral)
                    .Where(tp => tp.Referral != null && tp.Referral.PatientExternalId == patientExternalId)
                    .AsQueryable();

                if (!string.IsNullOrWhiteSpace(status))
                {
                    query = query.Where(tp => tp.Status == status);
                }

                var therapyPlans = await query
                    .OrderByDescending(tp => tp.CreatedAt)
                    .ToListAsync();

                return therapyPlans.Select(MapToFhirCarePlan).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving FHIR CarePlans for patient: {PatientId}", patientExternalId);
                return new List<FhirCarePlan>();
            }
        }

        public async Task<List<FhirCarePlan>> GetCarePlansByReferralAsync(int referralId)
        {
            try
            {
                var therapyPlans = await _context.TherapyPlans
                    .Include(tp => tp.Referral)
                    .Where(tp => tp.ReferralId == referralId)
                    .OrderByDescending(tp => tp.CreatedAt)
                    .ToListAsync();

                return therapyPlans.Select(MapToFhirCarePlan).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving FHIR CarePlans for referral: {ReferralId}", referralId);
                return new List<FhirCarePlan>();
            }
        }

        #endregion

        #region ServiceRequest (Referral) Resources

        public async Task<FhirServiceRequest?> GetServiceRequestByIdAsync(int referralId)
        {
            try
            {
                var referral = await _context.Referrals
                    .Include(r => r.Doctor)
                        .ThenInclude(d => d!.User)
                    .FirstOrDefaultAsync(r => r.ReferralId == referralId);

                if (referral == null)
                    return null;

                return MapToFhirServiceRequest(referral);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving FHIR ServiceRequest: {ReferralId}", referralId);
                return null;
            }
        }

        public async Task<List<FhirServiceRequest>> GetServiceRequestsByPatientAsync(string patientExternalId, string? status = null)
        {
            try
            {
                var query = _context.Referrals
                    .Include(r => r.Doctor)
                        .ThenInclude(d => d!.User)
                    .Where(r => r.PatientExternalId == patientExternalId)
                    .AsQueryable();

                if (!string.IsNullOrWhiteSpace(status))
                {
                    query = query.Where(r => r.Status == status);
                }

                var referrals = await query
                    .OrderByDescending(r => r.CreatedAt)
                    .ToListAsync();

                return referrals.Select(MapToFhirServiceRequest).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving FHIR ServiceRequests for patient: {PatientId}", patientExternalId);
                return new List<FhirServiceRequest>();
            }
        }

        public async Task<List<FhirServiceRequest>> GetServiceRequestsByPractitionerAsync(int doctorId, string? status = null)
        {
            try
            {
                var query = _context.Referrals
                    .Include(r => r.Doctor)
                        .ThenInclude(d => d!.User)
                    .Where(r => r.DoctorId == doctorId)
                    .AsQueryable();

                if (!string.IsNullOrWhiteSpace(status))
                {
                    query = query.Where(r => r.Status == status);
                }

                var referrals = await query
                    .OrderByDescending(r => r.CreatedAt)
                    .ToListAsync();

                return referrals.Select(MapToFhirServiceRequest).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving FHIR ServiceRequests for practitioner: {DoctorId}", doctorId);
                return new List<FhirServiceRequest>();
            }
        }

        #endregion

        #region Appointment Resources

        public async Task<FhirAppointment?> GetAppointmentByIdAsync(int appointmentId)
        {
            try
            {
                var appointment = await _context.Appointments
                    .Include(a => a.Doctor)
                        .ThenInclude(d => d!.User)
                    .Include(a => a.TimeSlot)
                    .FirstOrDefaultAsync(a => a.AppointmentId == appointmentId);

                if (appointment == null)
                    return null;

                return MapToFhirAppointment(appointment);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving FHIR Appointment: {AppointmentId}", appointmentId);
                return null;
            }
        }

        public async Task<List<FhirAppointment>> GetAppointmentsByPatientAsync(string patientExternalId, DateTime? dateFrom = null, DateTime? dateTo = null)
        {
            try
            {
                var query = _context.Appointments
                    .Include(a => a.Doctor)
                        .ThenInclude(d => d!.User)
                    .Include(a => a.TimeSlot)
                    .Where(a => a.PatientExternalId == patientExternalId)
                    .AsQueryable();

                if (dateFrom.HasValue)
                {
                    query = query.Where(a => a.TimeSlot != null && a.TimeSlot.SlotDate >= dateFrom.Value);
                }

                if (dateTo.HasValue)
                {
                    query = query.Where(a => a.TimeSlot != null && a.TimeSlot.SlotDate <= dateTo.Value);
                }

                var appointments = await query
                    .OrderByDescending(a => a.BookedAt)
                    .ToListAsync();

                return appointments.Select(MapToFhirAppointment).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving FHIR Appointments for patient: {PatientId}", patientExternalId);
                return new List<FhirAppointment>();
            }
        }

        public async Task<List<FhirAppointment>> GetAppointmentsByPractitionerAsync(int doctorId, DateTime? dateFrom = null, DateTime? dateTo = null)
        {
            try
            {
                var query = _context.Appointments
                    .Include(a => a.Doctor)
                        .ThenInclude(d => d!.User)
                    .Include(a => a.TimeSlot)
                    .Where(a => a.DoctorId == doctorId)
                    .AsQueryable();

                if (dateFrom.HasValue)
                {
                    query = query.Where(a => a.TimeSlot != null && a.TimeSlot.SlotDate >= dateFrom.Value);
                }

                if (dateTo.HasValue)
                {
                    query = query.Where(a => a.TimeSlot != null && a.TimeSlot.SlotDate <= dateTo.Value);
                }

                var appointments = await query
                    .OrderByDescending(a => a.BookedAt)
                    .ToListAsync();

                return appointments.Select(MapToFhirAppointment).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving FHIR Appointments for practitioner: {DoctorId}", doctorId);
                return new List<FhirAppointment>();
            }
        }

        #endregion

        #region Observation Resources

        public async Task<List<FhirObservation>> GetObservationsByPatientAsync(string patientExternalId, string? category = null)
        {
            try
            {
                // Get observations from consultations (diagnosis, symptoms, notes)
                var consultations = await _context.Consultations
                    .Include(c => c.Appointment)
                    .Where(c => c.Appointment != null && c.Appointment.PatientExternalId == patientExternalId)
                    .ToListAsync();

                var observations = new List<FhirObservation>();

                foreach (var consultation in consultations)
                {
                    // Create observation for diagnosis
                    if (!string.IsNullOrEmpty(consultation.Diagnosis))
                    {
                        observations.Add(new FhirObservation
                        {
                            id = $"obs-diagnosis-{consultation.ConsultationId}",
                            status = "final",
                            category = new FhirCodeableConcept
                            {
                                coding = new List<FhirCoding>
                                {
                                    new() { system = "http://terminology.hl7.org/CodeSystem/observation-category", code = "survey", display = "Survey" }
                                },
                                text = "Clinical Assessment"
                            },
                            code = new FhirCodeableConcept
                            {
                                coding = new List<FhirCoding>
                                {
                                    new() { system = "http://loinc.org", code = "11476-4", display = "Diagnosis" }
                                },
                                text = consultation.Diagnosis
                            },
                            subject = new FhirReference
                            {
                                reference = $"Patient/{patientExternalId}",
                                display = patientExternalId
                            },
                            effectiveDateTime = consultation.ConsultationDate.ToString("yyyy-MM-dd"),
                            encounter = new FhirReference
                            {
                                reference = $"Encounter/{consultation.AppointmentId}"
                            },
                            note = consultation.Notes
                        });
                    }
                }

                return observations;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving FHIR Observations for patient: {PatientId}", patientExternalId);
                return new List<FhirObservation>();
            }
        }

        public async Task<List<FhirObservation>> GetObservationsByEncounterAsync(int consultationId)
        {
            try
            {
                var consultation = await _context.Consultations
                    .Include(c => c.Appointment)
                    .FirstOrDefaultAsync(c => c.ConsultationId == consultationId);

                if (consultation == null)
                    return new List<FhirObservation>();

                var observations = new List<FhirObservation>();
                var patientExternalId = consultation.Appointment?.PatientExternalId ?? "unknown";

                // Symptoms observation
                if (!string.IsNullOrEmpty(consultation.Symptoms))
                {
                    observations.Add(new FhirObservation
                    {
                        id = $"obs-symptoms-{consultationId}",
                        status = "final",
                        category = new FhirCodeableConcept
                        {
                            coding = new List<FhirCoding>
                            {
                                new() { system = "http://terminology.hl7.org/CodeSystem/observation-category", code = "survey", display = "Survey" }
                            },
                            text = "Symptoms"
                        },
                        code = new FhirCodeableConcept
                        {
                            coding = new List<FhirCoding>
                            {
                                new() { system = "http://loinc.org", code = "75325-1", display = "Symptoms" }
                            },
                            text = "Patient Symptoms"
                        },
                        subject = new FhirReference
                        {
                            reference = $"Patient/{patientExternalId}"
                        },
                        effectiveDateTime = consultation.ConsultationDate.ToString("yyyy-MM-dd"),
                        valueString = consultation.Symptoms,
                        encounter = new FhirReference
                        {
                            reference = $"Encounter/{consultation.AppointmentId}"
                        }
                    });
                }

                // Diagnosis observation
                if (!string.IsNullOrEmpty(consultation.Diagnosis))
                {
                    observations.Add(new FhirObservation
                    {
                        id = $"obs-diagnosis-{consultationId}",
                        status = "final",
                        category = new FhirCodeableConcept
                        {
                            coding = new List<FhirCoding>
                            {
                                new() { system = "http://terminology.hl7.org/CodeSystem/observation-category", code = "survey", display = "Survey" }
                            },
                            text = "Diagnosis"
                        },
                        code = new FhirCodeableConcept
                        {
                            coding = new List<FhirCoding>
                            {
                                new() { system = "http://snomed.info/sct", code = "282291009", display = "Diagnosis" }
                            },
                            text = consultation.Diagnosis
                        },
                        subject = new FhirReference
                        {
                            reference = $"Patient/{patientExternalId}"
                        },
                        effectiveDateTime = consultation.ConsultationDate.ToString("yyyy-MM-dd"),
                        encounter = new FhirReference
                        {
                            reference = $"Encounter/{consultation.AppointmentId}"
                        },
                        note = consultation.Notes
                    });
                }

                return observations;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving FHIR Observations for encounter: {ConsultationId}", consultationId);
                return new List<FhirObservation>();
            }
        }

        #endregion

        #region Mapping Methods

        private FhirPatient MapToFhirPatient(PatientModel patient)
        {
            return new FhirPatient
            {
                id = patient.ExternalPatientId,
                identifier = new List<FhirIdentifier>
                {
                    new()
                    {
                        system = PATIENT_IDENTIFIER_SYSTEM,
                        value = patient.ExternalPatientId,
                        use = "official"
                    }
                },
                active = true,
                name = new List<FhirHumanName>
                {
                    new()
                    {
                        use = "usual",
                        text = patient.FullName,
                        given = new List<string> { patient.FullName.Split(' ').First() },
                        family = patient.FullName.Split(' ').Last()
                    }
                },
                telecom = !string.IsNullOrEmpty(patient.PhoneNumber) ? new List<FhirContactPoint>
                {
                    new()
                    {
                        system = "phone",
                        value = patient.PhoneNumber,
                        use = "mobile"
                    }
                } : null,
                meta_lastUpdated = patient.UpdatedAt
            };
        }

        private FhirPractitioner MapToFhirPractitioner(DoctorModel doctor)
        {
            var user = doctor.User;
            if (user == null)
                throw new InvalidOperationException("Doctor user profile not found");

            return new FhirPractitioner
            {
                id = doctor.DoctorId.ToString(),
                identifier = new List<FhirIdentifier>
                {
                    new()
                    {
                        system = PRACTITIONER_IDENTIFIER_SYSTEM,
                        value = doctor.DoctorId.ToString(),
                        use = "official"
                    },
                    new()
                    {
                        system = "https://clinic-system.com/license-number",
                        value = doctor.LicenseNumber ?? "",
                        use = "official"
                    }
                },
                active = doctor.IsActive,
                name = new List<FhirHumanName>
                {
                    new()
                    {
                        use = "usual",
                        given = new List<string> { user.FirstName },
                        family = user.LastName
                    }
                },
                telecom = !string.IsNullOrEmpty(user.PhoneNumber) ? new List<FhirContactPoint>
                {
                    new()
                    {
                        system = "phone",
                        value = user.PhoneNumber,
                        use = "work"
                    }
                } : null,
                qualification = new List<FhirPractitionerQualification>
                {
                    new()
                    {
                        code = new FhirCodeableConcept
                        {
                            coding = new List<FhirCoding>
                            {
                                new()
                                {
                                    system = "http://terminology.hl7.org/CodeSystem/v2-0360",
                                    code = doctor.Specialization,
                                    display = doctor.Specialization
                                }
                            },
                            text = doctor.Specialization
                        }
                    }
                }
            };
        }

        private FhirCondition MapToFhirCondition(ConsultationModel consultation)
        {
            var patientExternalId = consultation.Appointment?.PatientExternalId ?? "unknown";

            return new FhirCondition
            {
                id = $"condition-{consultation.ConsultationId}",
                identifier = new List<FhirIdentifier>
                {
                    new()
                    {
                        system = "https://clinic-system.com/consultation-id",
                        value = consultation.ConsultationId.ToString()
                    }
                },
                clinicalStatus = consultation.Status == "Completed" ? "resolved" : "active",
                verificationStatus = "confirmed",
                category = new FhirCodeableConcept
                {
                    coding = new List<FhirCoding>
                    {
                        new() { system = "http://terminology.hl7.org/CodeSystem/condition-category", code = "encounter-diagnosis", display = "Encounter Diagnosis" }
                    }
                },
                code = new FhirCodeableConcept
                {
                    coding = new List<FhirCoding>
                    {
                        new() { display = consultation.Diagnosis }
                    },
                    text = consultation.Diagnosis
                },
                subject = new FhirReference
                {
                    reference = $"Patient/{patientExternalId}"
                },
                encounter = new FhirReference
                {
                    reference = $"Encounter/{consultation.AppointmentId}"
                },
                recordedDate = consultation.ConsultationDate.ToString("yyyy-MM-dd"),
                note = consultation.Notes
            };
        }

        private FhirCarePlan MapToFhirCarePlan(TherapyPlanModel therapyPlan)
        {
            var patientExternalId = therapyPlan.Referral?.PatientExternalId ?? "unknown";

            return new FhirCarePlan
            {
                id = therapyPlan.TherapyPlanId.ToString(),
                identifier = new List<FhirIdentifier>
                {
                    new()
                    {
                        system = "https://clinic-system.com/therapy-plan-id",
                        value = therapyPlan.TherapyPlanId.ToString()
                    }
                },
                status = therapyPlan.Status.ToLower() switch
                {
                    "active" => "active",
                    "completed" => "completed",
                    "suspended" => "on-hold",
                    "cancelled" => "revoked",
                    _ => "unknown"
                },
                intent = "plan",
                category = new FhirCodeableConcept
                {
                    coding = new List<FhirCoding>
                    {
                        new()
                        {
                            system = "http://hl7.org/fhir/us/core/CodeSystem/careplan-category",
                            code = "assess-plan",
                            display = therapyPlan.TherapyType
                        }
                    },
                    text = therapyPlan.TherapyType
                },
                title = therapyPlan.PlanName,
                description = therapyPlan.Goals,
                subject = new FhirReference
                {
                    reference = $"Patient/{patientExternalId}"
                },
                period_start = therapyPlan.StartDate.ToString("yyyy-MM-dd"),
                period_end = therapyPlan.EstimatedEndDate?.ToString("yyyy-MM-dd"),
                created = therapyPlan.CreatedAt,
                note = therapyPlan.Precautions,
                activity = therapyPlan.Sessions?.Select(session => new FhirCarePlanActivity
                {
                    detail = new FhirCarePlanActivityDetail
                    {
                        status = session.Status?.ToLower() switch
                        {
                            "scheduled" => "scheduled",
                            "completed" => "completed",
                            "cancelled" => "cancelled",
                            _ => "not-started"
                        },
                        scheduled_start = session.SessionDateTime,
                        description = session.SessionNotes
                    }
                }).ToList()
            };
        }

        private FhirServiceRequest MapToFhirServiceRequest(ReferralModel referral)
        {
            return CLINICSYSTEM.Mappers.ReferralToFhirMapper.ToFhirServiceRequest(referral);
        }

        private FhirAppointment MapToFhirAppointment(AppointmentModel appointment)
        {
            var doctorName = appointment.Doctor?.User != null
                ? $"{appointment.Doctor.User.FirstName} {appointment.Doctor.User.LastName}"
                : "Unknown";

            var slotDate = appointment.TimeSlot?.SlotDate ?? DateTime.UtcNow;
            var startTime = appointment.TimeSlot?.StartTime ?? TimeSpan.Zero;
            var endTime = appointment.TimeSlot?.EndTime ?? TimeSpan.FromMinutes(30);

            return new FhirAppointment
            {
                id = appointment.AppointmentId.ToString(),
                identifier = new List<FhirIdentifier>
                {
                    new()
                    {
                        system = "https://clinic-system.com/appointment-id",
                        value = appointment.AppointmentId.ToString()
                    }
                },
                status = appointment.Status.ToLower() switch
                {
                    "scheduled" => "booked",
                    "confirmed" => "booked",
                    "checkedin" => "arrived",
                    "inprogress" => "fulfilled",
                    "completed" => "fulfilled",
                    "cancelled" => "cancelled",
                    "noshow" => "noshow",
                    _ => "pending"
                },
                serviceCategory = new FhirCodeableConcept
                {
                    coding = new List<FhirCoding>
                    {
                        new() { display = appointment.Doctor?.Specialization ?? "General" }
                    }
                },
                start = $"{slotDate:yyyy-MM-dd}T{startTime:hh\\:mm\\:ss}",
                end = $"{slotDate:yyyy-MM-dd}T{endTime:hh\\:mm\\:ss}",
                minutesDuration = (int)(endTime - startTime).TotalMinutes,
                created = appointment.BookedAt,
                description = appointment.ReasonForVisit,
                participant = new List<FhirAppointmentParticipant>
                {
                    new()
                    {
                        type = "patient",
                        actor = new FhirReference
                        {
                            reference = $"Patient/{appointment.PatientExternalId}"
                        },
                        status = "accepted"
                    },
                    new()
                    {
                        type = "practitioner",
                        actor = new FhirReference
                        {
                            reference = $"Practitioner/{appointment.DoctorId}",
                            display = doctorName
                        },
                        status = "accepted"
                    }
                },
                comment = appointment.CancellationReason
            };
        }

        #endregion
    }
}
