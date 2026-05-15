using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using CLINICSYSTEM.Services;
using CLINICSYSTEM.Data.DTOs;
using CLINICSYSTEM.Exceptions;
using CLINICSYSTEM.Mappers;
using CLINICSYSTEM.Models.FHIR;
using Hl7.Fhir.Serialization;

namespace CLINICSYSTEM.Controllers
{
    /// <summary>
    /// Controller for managing patient referrals to external services
    /// Supports creation, tracking, and status updates of referrals
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReferralsController : ControllerBase
    {
        private readonly IReferralService _referralService;
        private readonly ILogger<ReferralsController> _logger;
        private readonly IAppointmentService _appointmentService;

        /// <summary>
        /// Initializes a new instance of the ReferralsController
        /// </summary>
        /// <param name="referralService">Service for referral operations</param>
        /// <param name="logger">Logger for debugging and monitoring</param>
        public ReferralsController(IReferralService referralService, ILogger<ReferralsController> logger, IAppointmentService appointmentService)
        {
            _referralService = referralService ?? throw new ArgumentNullException(nameof(referralService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _appointmentService = appointmentService ?? throw new ArgumentNullException(nameof(appointmentService));
        }

        /// <summary>
        /// Create a new referral for a patient
        /// </summary>
        /// <param name="request">Referral creation request containing patient and service details</param>
        /// <returns>Created referral details with external reference if sent to external system</returns>
        /// <response code="200">Referral successfully created</response>
        /// <response code="400">Invalid request data or validation failed</response>
        /// <response code="401">Unauthorized - user not authenticated</response>
        /// <response code="500">Internal server error</response>
        [HttpPost]
        [Authorize(Roles = "Doctor,Admin")]
        [ProducesResponseType(typeof(ReferralDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> CreateReferral([FromBody] CreateReferralRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid referral request model state");
                    return BadRequest(new { errors = ModelState.Values.SelectMany(v => v.Errors) });
                }

                _logger.LogInformation("Creating referral for patient: {PatientId} by doctor: {DoctorId}",
                    request.PatientId, request.DoctorId);

                var referral = await _referralService.CreateReferralAsync(request);

                if (referral == null)
                {
                    _logger.LogError("Failed to create referral for patient: {PatientId}", request.PatientId);
                    return StatusCode(StatusCodes.Status500InternalServerError,
                        new { message = "Failed to create referral", code = "REFERRAL_CREATE_FAILED" });
                }

                _logger.LogInformation("Referral created successfully with ID: {ReferralId}", referral.ReferralId);
                return IsFhirRequest() ? FhirOk(referral) : Ok(ApiResponse.Ok(referral));
            }
            catch (BusinessException ex)
            {
                _logger.LogWarning("Business error creating referral: {Message}", ex.Message);
                return BadRequest(new { message = ex.Message, code = ex.MachineCode });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error creating referral");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = "An unexpected error occurred", code = "INTERNAL_SERVER_ERROR" });
            }
        }

        /// <summary>
        /// Get referral details by ID
        /// </summary>
        /// <param name="id">Referral ID</param>
        /// <returns>Referral details including status and external references</returns>
        /// <response code="200">Referral found and returned</response>
        /// <response code="404">Referral not found</response>
        /// <response code="401">Unauthorized - user not authenticated</response>
        /// <response code="500">Internal server error</response>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ReferralDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetReferral(int id)
        {
            try
            {
                _logger.LogInformation("Retrieving referral: {ReferralId}", id);

                var referral = await _referralService.GetReferralByIdAsync(id);

                if (referral == null)
                {
                    _logger.LogWarning("Referral not found: {ReferralId}", id);
                    return NotFound(new { message = "Referral not found", code = "REFERRAL_NOT_FOUND" });
                }

                return IsFhirRequest() ? FhirOk(referral) : Ok(ApiResponse.Ok(referral));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving referral: {ReferralId}", id);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = "An unexpected error occurred", code = "INTERNAL_SERVER_ERROR" });
            }
        }

        /// <summary>
        /// Get all referrals for a specific doctor
        /// </summary>
        /// <param name="doctorId">Doctor ID</param>
        /// <param name="status">Optional status filter (Pending, Sent, Accepted, InProgress, Completed, Cancelled)</param>
        /// <returns>List of referrals for the doctor</returns>
        /// <response code="200">Referrals retrieved successfully</response>
        /// <response code="401">Unauthorized - user not authenticated</response>
        /// <response code="403">Forbidden - insufficient permissions</response>
        /// <response code="500">Internal server error</response>
        [HttpGet("doctor/{doctorId}")]
        [Authorize(Roles = "Doctor,Admin")]
        [ProducesResponseType(typeof(List<ReferralDTO>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetDoctorReferrals(int doctorId, [FromQuery] string? status = null)
        {
            try
            {
                _logger.LogInformation("Retrieving referrals for doctor: {DoctorId}, status filter: {Status}",
                    doctorId, status ?? "none");

                var referrals = await _referralService.GetDoctorReferralsAsync(doctorId, status);

                return IsFhirRequest() ? FhirBundleOk(referrals) : Ok(ApiResponse.Ok(referrals ?? new List<ReferralDTO>()));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving referrals for doctor: {DoctorId}", doctorId);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = "An unexpected error occurred", code = "INTERNAL_SERVER_ERROR" });
            }
        }

        /// <summary>
        /// Get referrals for the currently logged-in user based on their role
        /// </summary>
        /// <param name="status">Optional status filter</param>
        /// <returns>List of referrals</returns>
        [HttpGet("my-referrals")]
        [Authorize]
        [ProducesResponseType(typeof(List<ReferralDTO>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetMyReferrals([FromQuery] string? status = null)
        {
            try
            {
                var userId = GetUserId();
                if (userId == 0) return Unauthorized();

                var userRole = GetUserRole();
                if (string.IsNullOrEmpty(userRole)) return Forbid();

                _logger.LogInformation("Retrieving 'my-referrals' for user {UserId} with role {UserRole}", userId, userRole);

                var referrals = await _referralService.GetMyReferralsAsync(userId, userRole, status);

                return IsFhirRequest() ? FhirBundleOk(referrals) : Ok(ApiResponse.Ok(referrals ?? new List<ReferralDTO>()));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving 'my-referrals'");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { success = false, message = "An unexpected error occurred", code = "INTERNAL_SERVER_ERROR" });
            }
        }

        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            return userIdClaim != null && int.TryParse(userIdClaim.Value, out var id) ? id : 0;
        }

        private string? GetUserRole()
        {
            return User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        }

        private bool IsFhirRequest()
        {
            return Request.Headers["Accept"].ToString().Contains("application/fhir+json", StringComparison.OrdinalIgnoreCase);
        }

        private IActionResult FhirOk(ReferralDTO referral)
        {
            var fhirRequest = ReferralToFhirMapper.ToFhirServiceRequest(referral);
            var serializer = new FhirJsonSerializer();
            return Content(serializer.SerializeToString(fhirRequest), "application/fhir+json");
        }

        private IActionResult FhirBundleOk(IEnumerable<ReferralDTO> referrals)
        {
            var bundle = new Hl7.Fhir.Model.Bundle
            {
                Type = Hl7.Fhir.Model.Bundle.BundleType.Searchset
            };
            foreach (var r in referrals)
            {
                bundle.Entry.Add(new Hl7.Fhir.Model.Bundle.EntryComponent
                {
                    Resource = ReferralToFhirMapper.ToFhirServiceRequest(r)
                });
            }
            var serializer = new FhirJsonSerializer();
            return Content(serializer.SerializeToString(bundle), "application/fhir+json");
        }

        /// <summary>
        /// Get all referrals for a specific patient
        /// </summary>
        /// <param name="patientExternalId">Patient external ID</param>
        /// <returns>List of referrals for the patient</returns>
        /// <response code="200">Referrals retrieved successfully</response>
        /// <response code="401">Unauthorized - user not authenticated</response>
        /// <response code="500">Internal server error</response>
        [HttpGet("patient/{patientExternalId}")]
        [ProducesResponseType(typeof(List<ReferralDTO>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetPatientReferrals(string patientExternalId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(patientExternalId))
                {
                    _logger.LogWarning("Invalid patient external ID provided");
                    return BadRequest(new { message = "Patient ID is required", code = "INVALID_PATIENT_ID" });
                }

                _logger.LogInformation("Retrieving referrals for patient: {PatientId}", patientExternalId);

                var referrals = await _referralService.GetPatientReferralsAsync(patientExternalId);

                return IsFhirRequest() ? FhirBundleOk(referrals) : Ok(ApiResponse.Ok(referrals ?? new List<ReferralDTO>()));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving referrals for patient: {PatientId}", patientExternalId);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = "An unexpected error occurred", code = "INTERNAL_SERVER_ERROR" });
            }
        }

        /// <summary>
        /// Update the status of a referral
        /// </summary>
        /// <param name="id">Referral ID</param>
        /// <param name="request">Status update request with new status and optional feedback</param>
        /// <returns>Updated referral details</returns>
        /// <response code="200">Referral status updated successfully</response>
        /// <response code="400">Invalid request data or invalid status</response>
        /// <response code="401">Unauthorized - user not authenticated</response>
        /// <response code="403">Forbidden - insufficient permissions</response>
        /// <response code="404">Referral not found</response>
        /// <response code="500">Internal server error</response>
        [HttpPut("{id}/status")]
        [Authorize(Roles = "Doctor,Admin,Physiotherapist,Radiologist,Nurse")]
        [ProducesResponseType(typeof(ReferralDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UpdateReferralStatus(int id, [FromBody] UpdateReferralStatusRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid update status request model state for referral: {ReferralId}", id);
                    return BadRequest(new { success = false, errors = ModelState.Values.SelectMany(v => v.Errors) });
                }

                _logger.LogInformation("Updating referral {ReferralId} status to: {Status}", id, request.Status);

                var userId = GetUserId();
                var userRole = GetUserRole() ?? string.Empty;
                if (userId == 0 || string.IsNullOrEmpty(userRole))
                {
                    return Unauthorized(ApiResponse.Fail("User not authenticated"));
                }

                var success = await _referralService.UpdateReferralStatusAsync(id, request, userId, userRole);

                if (!success)
                {
                    _logger.LogWarning("Referral not found or update failed: {ReferralId}", id);
                    return NotFound(new { success = false, message = "Referral not found or update failed", code = "REFERRAL_UPDATE_FAILED" });
                }

                var referral = await _referralService.GetReferralByIdAsync(id);
                if (referral == null) return NotFound(new { success = false, message = "Referral not found after update", code = "REFERRAL_NOT_FOUND" });
                
                return IsFhirRequest()
                    ? FhirOk(referral)
                    : Ok(ApiResponse.Ok(referral));
            }
            catch (BusinessException ex)
            {
                _logger.LogWarning("Business error updating referral status: {Message}", ex.Message);
                return BadRequest(new { success = false, message = ex.Message, code = ex.MachineCode });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating referral status: {ReferralId}", id);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { success = false, message = "An unexpected error occurred", code = "INTERNAL_SERVER_ERROR" });
            }
        }

        /// <summary>
        /// Send referral to external system (Physiotherapy, Radiology, etc.)
        /// </summary>
        /// <param name="id">Referral ID</param>
        /// <returns>Confirmation of sending referral to external system</returns>
        /// <response code="200">Referral sent to external system successfully</response>
        /// <response code="400">Referral already sent or invalid state</response>
        /// <response code="401">Unauthorized - user not authenticated</response>
        /// <response code="403">Forbidden - insufficient permissions</response>
        /// <response code="404">Referral not found</response>
        /// <response code="500">Internal server error or external system communication failure</response>
        [HttpPost("{id}/send")]
        [Authorize(Roles = "Doctor,Admin")]
        [ProducesResponseType(typeof(ReferralDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> SendReferralToExternalSystem(int id)
        {
            // This endpoint is deprecated as the new implementation does not require manual sending.
            return await Task.FromResult(StatusCode(StatusCodes.Status410Gone, new { message = "This endpoint is no longer available." }));
        }

        [HttpGet("{id}/appointment")]
        [Authorize(Roles = "Doctor,Physiotherapist,Radiologist,Nurse")]
        [ProducesResponseType(typeof(AppointmentDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetAppointmentForReferral(int id)
        {
            var referral = await _referralService.GetReferralByIdAsync(id);
            if (referral?.LinkedAppointmentId == null)
            {
                return NotFound(new { success = false, message = "No appointment booked yet for this referral" });
            }

            var appointment = await _appointmentService.GetAppointmentDetailsAsync(referral.LinkedAppointmentId.Value);
            if (appointment == null)
            {
                return NotFound(new { success = false, message = "Appointment not found" });
            }

            return Ok(ApiResponse.Ok(appointment));
        }

        [HttpGet("stats")]
        [Authorize(Roles = "Doctor,Nurse,Physiotherapist,Radiologist")]
        public async Task<IActionResult> GetReferralStats()
        {
            var userId = GetUserId();
            var userRole = GetUserRole();

            if (userId == 0 || string.IsNullOrEmpty(userRole))
            {
                return Unauthorized();
            }

            var stats = await _referralService.GetReferralStatsAsync(userId, userRole);
            return Ok(ApiResponse.Ok(stats));
        }
    }
}