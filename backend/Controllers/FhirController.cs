using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using CLINICSYSTEM.Services;
using CLINICSYSTEM.Models.FHIR;
using CLINICSYSTEM.Data.DTOs.FHIR;

namespace CLINICSYSTEM.Controllers
{
    /// <summary>
    /// FHIR R4 Compliant API Controller
    /// Provides HL7 FHIR standard endpoints for healthcare interoperability
    /// Designed for integration with external systems (e.g., Physiotherapy Clinic)
    /// 
    /// Base URL: /fhir
    /// Reference: http://hl7.org/fhir/R4/
    /// </summary>
    [ApiController]
    [Route("fhir")]
    [Produces("application/fhir+json")]
    [Authorize]
    public class FhirController : ControllerBase
    {
        private readonly IFhirService _fhirService;
        private readonly ILogger<FhirController> _logger;
        private const string FHIR_BASE_URL = "/fhir";

        public FhirController(IFhirService fhirService, ILogger<FhirController> logger)
        {
            _fhirService = fhirService ?? throw new ArgumentNullException(nameof(fhirService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        #region FHIR Capability Statement

        /// <summary>
        /// FHIR Capability Statement - Describes supported FHIR resources and operations
        /// Standard FHIR endpoint: GET /fhir/metadata
        /// </summary>
        [HttpGet("metadata")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(FhirCapabilityStatement), StatusCodes.Status200OK)]
        public IActionResult GetCapabilityStatement()
        {
            var capabilityStatement = new FhirCapabilityStatement
            {
                date = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ"),
                publisher = "Clinic Management System",
                software_name = "Clinic System FHIR Server",
                software_version = "1.0.0",
                rest = new List<FhirRestResource>
                {
                    new()
                    {
                        type = "Patient",
                        interaction = new List<string> { "read", "search-type" },
                        searchParam = new List<string> { "identifier", "name" }
                    },
                    new()
                    {
                        type = "Practitioner",
                        interaction = new List<string> { "read", "search-type" },
                        searchParam = new List<string> { "name" }
                    },
                    new()
                    {
                        type = "Condition",
                        interaction = new List<string> { "read", "search-type" },
                        searchParam = new List<string> { "patient", "category" }
                    },
                    new()
                    {
                        type = "CarePlan",
                        interaction = new List<string> { "read", "search-type" },
                        searchParam = new List<string> { "patient", "status", "date" }
                    },
                    new()
                    {
                        type = "ServiceRequest",
                        interaction = new List<string> { "read", "search-type" },
                        searchParam = new List<string> { "patient", "status", "priority" }
                    },
                    new()
                    {
                        type = "Appointment",
                        interaction = new List<string> { "read", "search-type" },
                        searchParam = new List<string> { "patient", "practitioner", "date" }
                    },
                    new()
                    {
                        type = "Observation",
                        interaction = new List<string> { "read", "search-type" },
                        searchParam = new List<string> { "patient", "category", "date" }
                    }
                }
            };

            return Ok(capabilityStatement);
        }

        #endregion

        #region Patient Resources

        /// <summary>
        /// Get Patient by ID (FHIR Resource: Patient)
        /// GET /fhir/Patient/{id}
        /// </summary>
        [HttpGet("Patient/{id}")]
        [ProducesResponseType(typeof(FhirPatient), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(FhirOperationOutcome), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetPatient(string id)
        {
            try
            {
                _logger.LogInformation("FHIR: Retrieving Patient: {PatientId}", id);

                var patient = await _fhirService.GetPatientByIdAsync(id);

                if (patient == null)
                {
                    return NotFound(CreateOperationOutcome("error", "not-found", $"Patient {id} not found"));
                }

                return Ok(patient);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "FHIR: Error retrieving Patient: {PatientId}", id);
                return StatusCode(500, CreateOperationOutcome("fatal", "exception", "Internal server error"));
            }
        }

        /// <summary>
        /// Search Patients (FHIR Resource: Patient)
        /// GET /fhir/Patient?identifier={externalId}&name={name}
        /// </summary>
        [HttpGet("Patient")]
        [ProducesResponseType(typeof(FhirBundle<FhirPatient>), StatusCodes.Status200OK)]
        public async Task<IActionResult> SearchPatients([FromQuery] string? identifier = null, [FromQuery] string? name = null)
        {
            try
            {
                _logger.LogInformation("FHIR: Searching Patients - identifier: {Identifier}, name: {Name}", identifier, name);

                var patients = await _fhirService.SearchPatientsAsync(name, identifier);

                var bundle = new FhirBundle<FhirPatient>
                {
                    total = patients.Count,
                    entry = patients.Select(p => new FhirBundleEntry<FhirPatient>
                    {
                        resource = p,
                        fullUrl = $"{FHIR_BASE_URL}/Patient/{p.id}"
                    }).ToList()
                };

                return Ok(bundle);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "FHIR: Error searching Patients");
                return StatusCode(500, CreateOperationOutcome("fatal", "exception", "Internal server error"));
            }
        }

        #endregion

        #region Practitioner Resources

        /// <summary>
        /// Get Practitioner by ID (FHIR Resource: Practitioner)
        /// GET /fhir/Practitioner/{id}
        /// </summary>
        [HttpGet("Practitioner/{id}")]
        [ProducesResponseType(typeof(FhirPractitioner), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(FhirOperationOutcome), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetPractitioner(int id)
        {
            try
            {
                _logger.LogInformation("FHIR: Retrieving Practitioner: {PractitionerId}", id);

                var practitioner = await _fhirService.GetPractitionerByIdAsync(id);

                if (practitioner == null)
                {
                    return NotFound(CreateOperationOutcome("error", "not-found", $"Practitioner {id} not found"));
                }

                return Ok(practitioner);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "FHIR: Error retrieving Practitioner: {PractitionerId}", id);
                return StatusCode(500, CreateOperationOutcome("fatal", "exception", "Internal server error"));
            }
        }

        /// <summary>
        /// Search Practitioners (FHIR Resource: Practitioner)
        /// GET /fhir/Practitioner?name={name}
        /// </summary>
        [HttpGet("Practitioner")]
        [ProducesResponseType(typeof(FhirBundle<FhirPractitioner>), StatusCodes.Status200OK)]
        public async Task<IActionResult> SearchPractitioners([FromQuery] string? name = null, [FromQuery] string? specialization = null)
        {
            try
            {
                _logger.LogInformation("FHIR: Searching Practitioners - name: {Name}, specialization: {Specialization}", name, specialization);

                var practitioners = await _fhirService.SearchPractitionersAsync(name, specialization);

                var bundle = new FhirBundle<FhirPractitioner>
                {
                    total = practitioners.Count,
                    entry = practitioners.Select(p => new FhirBundleEntry<FhirPractitioner>
                    {
                        resource = p,
                        fullUrl = $"{FHIR_BASE_URL}/Practitioner/{p.id}"
                    }).ToList()
                };

                return Ok(bundle);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "FHIR: Error searching Practitioners");
                return StatusCode(500, CreateOperationOutcome("fatal", "exception", "Internal server error"));
            }
        }

        #endregion

        #region Condition (Diagnosis) Resources

        /// <summary>
        /// Get Condition by ID (FHIR Resource: Condition)
        /// GET /fhir/Condition/{id}
        /// Note: ID format is "condition-{consultationId}"
        /// </summary>
        [HttpGet("Condition/{id}")]
        [ProducesResponseType(typeof(FhirCondition), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(FhirOperationOutcome), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetCondition(string id)
        {
            try
            {
                _logger.LogInformation("FHIR: Retrieving Condition: {ConditionId}", id);

                // Extract consultation ID from format "condition-{consultationId}"
                if (!id.StartsWith("condition-") || !int.TryParse(id.Replace("condition-", ""), out var consultationId))
                {
                    return BadRequest(CreateOperationOutcome("error", "invalid", "Invalid Condition ID format. Expected: condition-{consultationId}"));
                }

                var condition = await _fhirService.GetConditionByConsultationIdAsync(consultationId);

                if (condition == null)
                {
                    return NotFound(CreateOperationOutcome("error", "not-found", $"Condition {id} not found"));
                }

                return Ok(condition);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "FHIR: Error retrieving Condition: {ConditionId}", id);
                return StatusCode(500, CreateOperationOutcome("fatal", "exception", "Internal server error"));
            }
        }

        /// <summary>
        /// Search Conditions by Patient (FHIR Resource: Condition)
        /// GET /fhir/Condition?patient={patientExternalId}
        /// </summary>
        [HttpGet("Condition")]
        [ProducesResponseType(typeof(FhirBundle<FhirCondition>), StatusCodes.Status200OK)]
        public async Task<IActionResult> SearchConditions([FromQuery] string? patient = null)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(patient))
                {
                    return BadRequest(CreateOperationOutcome("error", "required", "Patient parameter is required"));
                }

                _logger.LogInformation("FHIR: Searching Conditions for patient: {PatientId}", patient);

                var conditions = await _fhirService.GetConditionsByPatientAsync(patient);

                var bundle = new FhirBundle<FhirCondition>
                {
                    total = conditions.Count,
                    entry = conditions.Select(c => new FhirBundleEntry<FhirCondition>
                    {
                        resource = c,
                        fullUrl = $"{FHIR_BASE_URL}/Condition/{c.id}"
                    }).ToList()
                };

                return Ok(bundle);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "FHIR: Error searching Conditions");
                return StatusCode(500, CreateOperationOutcome("fatal", "exception", "Internal server error"));
            }
        }

        #endregion

        #region CarePlan (Therapy Plan) Resources

        /// <summary>
        /// Get CarePlan by ID (FHIR Resource: CarePlan)
        /// GET /fhir/CarePlan/{id}
        /// </summary>
        [HttpGet("CarePlan/{id}")]
        [ProducesResponseType(typeof(FhirCarePlan), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(FhirOperationOutcome), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetCarePlan(int id)
        {
            try
            {
                _logger.LogInformation("FHIR: Retrieving CarePlan: {CarePlanId}", id);

                var carePlan = await _fhirService.GetCarePlanByIdAsync(id);

                if (carePlan == null)
                {
                    return NotFound(CreateOperationOutcome("error", "not-found", $"CarePlan {id} not found"));
                }

                return Ok(carePlan);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "FHIR: Error retrieving CarePlan: {CarePlanId}", id);
                return StatusCode(500, CreateOperationOutcome("fatal", "exception", "Internal server error"));
            }
        }

        /// <summary>
        /// Search CarePlans by Patient (FHIR Resource: CarePlan)
        /// GET /fhir/CarePlan?patient={patientExternalId}&status={status}
        /// </summary>
        [HttpGet("CarePlan")]
        [ProducesResponseType(typeof(FhirBundle<FhirCarePlan>), StatusCodes.Status200OK)]
        public async Task<IActionResult> SearchCarePlans([FromQuery] string? patient = null, [FromQuery] string? status = null)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(patient))
                {
                    return BadRequest(CreateOperationOutcome("error", "required", "Patient parameter is required"));
                }

                _logger.LogInformation("FHIR: Searching CarePlans for patient: {PatientId}, status: {Status}", patient, status);

                var carePlans = await _fhirService.GetCarePlansByPatientAsync(patient, status);

                var bundle = new FhirBundle<FhirCarePlan>
                {
                    total = carePlans.Count,
                    entry = carePlans.Select(cp => new FhirBundleEntry<FhirCarePlan>
                    {
                        resource = cp,
                        fullUrl = $"{FHIR_BASE_URL}/CarePlan/{cp.id}"
                    }).ToList()
                };

                return Ok(bundle);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "FHIR: Error searching CarePlans");
                return StatusCode(500, CreateOperationOutcome("fatal", "exception", "Internal server error"));
            }
        }

        #endregion

        #region ServiceRequest (Referral) Resources

        /// <summary>
        /// Get ServiceRequest (Referral) by ID (FHIR Resource: ServiceRequest)
        /// GET /fhir/ServiceRequest/{id}
        /// </summary>
        [HttpGet("ServiceRequest/{id}")]
        [ProducesResponseType(typeof(FhirServiceRequest), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(FhirOperationOutcome), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetServiceRequest(string id)
        {
            try
            {
                _logger.LogInformation("FHIR: Retrieving ServiceRequest: {ServiceRequestId}", id);

                FhirServiceRequest? serviceRequest = null;
                if (int.TryParse(id, out var referralId))
                {
                    serviceRequest = await _fhirService.GetServiceRequestByIdAsync(referralId);
                }

                serviceRequest ??= await _fhirService.GetServiceRequestByFhirIdAsync(id);

                if (serviceRequest == null)
                {
                    return NotFound(CreateOperationOutcome("error", "not-found", $"ServiceRequest {id} not found"));
                }

                return Ok(serviceRequest);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "FHIR: Error retrieving ServiceRequest: {ServiceRequestId}", id);
                return StatusCode(500, CreateOperationOutcome("fatal", "exception", "Internal server error"));
            }
        }

        /// <summary>
        /// Search ServiceRequests (Referrals) by Patient or Practitioner
        /// GET /fhir/ServiceRequest?patient={patientExternalId}&status={status}
        /// GET /fhir/ServiceRequest?practitioner={doctorId}&status={status}
        /// </summary>
        [HttpGet("ServiceRequest")]
        [ProducesResponseType(typeof(FhirBundle<FhirServiceRequest>), StatusCodes.Status200OK)]
        public async Task<IActionResult> SearchServiceRequests(
            [FromQuery] string? patient = null,
            [FromQuery] int? practitioner = null,
            [FromQuery] string? status = null)
        {
            try
            {
                List<FhirServiceRequest> serviceRequests;

                if (!string.IsNullOrWhiteSpace(patient))
                {
                    _logger.LogInformation("FHIR: Searching ServiceRequests for patient: {PatientId}", patient);
                    serviceRequests = await _fhirService.GetServiceRequestsByPatientAsync(patient, status);
                }
                else if (practitioner.HasValue)
                {
                    _logger.LogInformation("FHIR: Searching ServiceRequests for practitioner: {PractitionerId}", practitioner);
                    serviceRequests = await _fhirService.GetServiceRequestsByPractitionerAsync(practitioner.Value, status);
                }
                else
                {
                    _logger.LogInformation("FHIR: Returning all ServiceRequests");
                    serviceRequests = await _fhirService.GetAllServiceRequestsAsync(status);
                }

                var bundle = new FhirBundle<FhirServiceRequest>
                {
                    total = serviceRequests.Count,
                    entry = serviceRequests.Select(sr => new FhirBundleEntry<FhirServiceRequest>
                    {
                        resource = sr,
                        fullUrl = $"{FHIR_BASE_URL}/ServiceRequest/{sr.Id}"
                    }).ToList()
                };

                return Ok(bundle);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "FHIR: Error searching ServiceRequests");
                return StatusCode(500, CreateOperationOutcome("fatal", "exception", "Internal server error"));
            }
        }

        #endregion

        #region Appointment Resources

        /// <summary>
        /// Get Appointment by ID (FHIR Resource: Appointment)
        /// GET /fhir/Appointment/{id}
        /// </summary>
        [HttpGet("Appointment/{id}")]
        [ProducesResponseType(typeof(FhirAppointment), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(FhirOperationOutcome), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetAppointment(int id)
        {
            try
            {
                _logger.LogInformation("FHIR: Retrieving Appointment: {AppointmentId}", id);

                var appointment = await _fhirService.GetAppointmentByIdAsync(id);

                if (appointment == null)
                {
                    return NotFound(CreateOperationOutcome("error", "not-found", $"Appointment {id} not found"));
                }

                return Ok(appointment);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "FHIR: Error retrieving Appointment: {AppointmentId}", id);
                return StatusCode(500, CreateOperationOutcome("fatal", "exception", "Internal server error"));
            }
        }

        /// <summary>
        /// Search Appointments by Patient or Practitioner
        /// GET /fhir/Appointment?patient={patientExternalId}&date={date}
        /// GET /fhir/Appointment?practitioner={doctorId}&date={date}
        /// </summary>
        [HttpGet("Appointment")]
        [ProducesResponseType(typeof(FhirBundle<FhirAppointment>), StatusCodes.Status200OK)]
        public async Task<IActionResult> SearchAppointments(
            [FromQuery] string? patient = null,
            [FromQuery] int? practitioner = null,
            [FromQuery] DateTime? date = null)
        {
            try
            {
                List<FhirAppointment> appointments;

                if (!string.IsNullOrWhiteSpace(patient))
                {
                    _logger.LogInformation("FHIR: Searching Appointments for patient: {PatientId}", patient);
                    var dateFrom = date ?? DateTime.UtcNow.Date;
                    var dateTo = dateFrom.AddDays(1);
                    appointments = await _fhirService.GetAppointmentsByPatientAsync(patient, dateFrom, dateTo);
                }
                else if (practitioner.HasValue)
                {
                    _logger.LogInformation("FHIR: Searching Appointments for practitioner: {PractitionerId}", practitioner);
                    var dateFrom = date ?? DateTime.UtcNow.Date;
                    var dateTo = dateFrom.AddDays(1);
                    appointments = await _fhirService.GetAppointmentsByPractitionerAsync(practitioner.Value, dateFrom, dateTo);
                }
                else
                {
                    return BadRequest(CreateOperationOutcome("error", "required", "Either patient or practitioner parameter is required"));
                }

                var bundle = new FhirBundle<FhirAppointment>
                {
                    total = appointments.Count,
                    entry = appointments.Select(a => new FhirBundleEntry<FhirAppointment>
                    {
                        resource = a,
                        fullUrl = $"{FHIR_BASE_URL}/Appointment/{a.id}"
                    }).ToList()
                };

                return Ok(bundle);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "FHIR: Error searching Appointments");
                return StatusCode(500, CreateOperationOutcome("fatal", "exception", "Internal server error"));
            }
        }

        #endregion

        #region Observation Resources

        /// <summary>
        /// Search Observations by Patient (FHIR Resource: Observation)
        /// GET /fhir/Observation?patient={patientExternalId}&category={category}
        /// </summary>
        [HttpGet("Observation")]
        [ProducesResponseType(typeof(FhirBundle<FhirObservation>), StatusCodes.Status200OK)]
        public async Task<IActionResult> SearchObservations(
            [FromQuery] string? patient = null,
            [FromQuery] string? category = null)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(patient))
                {
                    return BadRequest(CreateOperationOutcome("error", "required", "Patient parameter is required"));
                }

                _logger.LogInformation("FHIR: Searching Observations for patient: {PatientId}, category: {Category}", patient, category);

                var observations = await _fhirService.GetObservationsByPatientAsync(patient, category);

                var bundle = new FhirBundle<FhirObservation>
                {
                    total = observations.Count,
                    entry = observations.Select(o => new FhirBundleEntry<FhirObservation>
                    {
                        resource = o,
                        fullUrl = $"{FHIR_BASE_URL}/Observation/{o.id}"
                    }).ToList()
                };

                return Ok(bundle);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "FHIR: Error searching Observations");
                return StatusCode(500, CreateOperationOutcome("fatal", "exception", "Internal server error"));
            }
        }

        /// <summary>
        /// Get Observations by Encounter (FHIR Resource: Observation)
        /// GET /fhir/Observation?encounter={consultationId}
        /// </summary>
        [HttpGet("Observation/encounter/{encounterId}")]
        [ProducesResponseType(typeof(FhirBundle<FhirObservation>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetObservationsByEncounter(int encounterId)
        {
            try
            {
                _logger.LogInformation("FHIR: Retrieving Observations for encounter: {EncounterId}", encounterId);

                var observations = await _fhirService.GetObservationsByEncounterAsync(encounterId);

                var bundle = new FhirBundle<FhirObservation>
                {
                    total = observations.Count,
                    entry = observations.Select(o => new FhirBundleEntry<FhirObservation>
                    {
                        resource = o,
                        fullUrl = $"{FHIR_BASE_URL}/Observation/{o.id}"
                    }).ToList()
                };

                return Ok(bundle);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "FHIR: Error retrieving Observations for encounter: {EncounterId}", encounterId);
                return StatusCode(500, CreateOperationOutcome("fatal", "exception", "Internal server error"));
            }
        }

        #endregion

        #region Helper Methods

        /// <summary>
        /// Create FHIR OperationOutcome for error responses
        /// </summary>
        private FhirOperationOutcome CreateOperationOutcome(string severity, string code, string details)
        {
            return new FhirOperationOutcome
            {
                issue = new List<FhirIssue>
                {
                    new()
                    {
                        severity = severity,
                        code = code,
                        details_text = details
                    }
                }
            };
        }

        #endregion
    }
}
