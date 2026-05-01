using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using CLINICSYSTEM.Services;
using CLINICSYSTEM.Data.DTOs;
using CLINICSYSTEM.Exceptions;

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

        /// <summary>
        /// Initializes a new instance of the ReferralsController
        /// </summary>
        /// <param name="referralService">Service for referral operations</param>
        /// <param name="logger">Logger for debugging and monitoring</param>
        public ReferralsController(IReferralService referralService, ILogger<ReferralsController> logger)
        {
            _referralService = referralService ?? throw new ArgumentNullException(nameof(referralService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
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
                    request.PatientExternalId, request.DoctorId);

                var referral = await _referralService.CreateReferralAsync(request);

                if (referral == null)
                {
                    _logger.LogError("Failed to create referral for patient: {PatientId}", request.PatientExternalId);
                    return StatusCode(StatusCodes.Status500InternalServerError,
                        new { message = "Failed to create referral", code = "REFERRAL_CREATE_FAILED" });
                }

                _logger.LogInformation("Referral created successfully with ID: {ReferralId}", referral.ReferralId);
                return Ok(referral);
            }
            catch (BusinessException ex)
            {
                _logger.LogWarning("Business error creating referral: {Message}", ex.Message);
                return BadRequest(new { message = ex.Message, code = ex.Code });
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

                return Ok(referral);
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

                return Ok(referrals);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving referrals for doctor: {DoctorId}", doctorId);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = "An unexpected error occurred", code = "INTERNAL_SERVER_ERROR" });
            }
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

                return Ok(referrals);
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
        [Authorize(Roles = "Doctor,Admin")]
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
                    return BadRequest(new { errors = ModelState.Values.SelectMany(v => v.Errors) });
                }

                _logger.LogInformation("Updating referral {ReferralId} status to: {Status}", id, request.Status);

                var success = await _referralService.UpdateReferralStatusAsync(id, request);

                if (!success)
                {
                    _logger.LogWarning("Referral not found: {ReferralId}", id);
                    return NotFound(new { message = "Referral not found", code = "REFERRAL_NOT_FOUND" });
                }

                var referral = await _referralService.GetReferralByIdAsync(id);
                return Ok(referral);
            }
            catch (BusinessException ex)
            {
                _logger.LogWarning("Business error updating referral status: {Message}", ex.Message);
                return BadRequest(new { message = ex.Message, code = ex.Code });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating referral status: {ReferralId}", id);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = "An unexpected error occurred", code = "INTERNAL_SERVER_ERROR" });
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
            try
            {
                _logger.LogInformation("Sending referral {ReferralId} to external system", id);

                var referral = await _referralService.GetReferralByIdAsync(id);
                if (referral == null)
                {
                    _logger.LogWarning("Referral not found: {ReferralId}", id);
                    return NotFound(new { message = "Referral not found", code = "REFERRAL_NOT_FOUND" });
                }

                if (referral.Status == "Sent" && !string.IsNullOrEmpty(referral.ExternalReferralId))
                {
                    _logger.LogWarning("Referral already sent: {ReferralId}", id);
                    return BadRequest(new
                    {
                        message = "Referral has already been sent to external system",
                        code = "REFERRAL_ALREADY_SENT",
                        externalId = referral.ExternalReferralId
                    });
                }

                var success = await _referralService.SendToExternalSystemAsync(id);

                if (!success)
                {
                    _logger.LogError("Failed to send referral {ReferralId} to external system", id);
                    return StatusCode(StatusCodes.Status500InternalServerError,
                        new
                        {
                            message = "Failed to send referral to external system",
                            code = "EXTERNAL_SYSTEM_ERROR"
                        });
                }

                var updatedReferral = await _referralService.GetReferralByIdAsync(id);
                _logger.LogInformation("Referral {ReferralId} sent successfully to external system", id);
                return Ok(updatedReferral);
            }
            catch (BusinessException ex)
            {
                _logger.LogWarning("Business error sending referral: {Message}", ex.Message);
                return BadRequest(new { message = ex.Message, code = ex.Code });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending referral {ReferralId} to external system", id);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = "An unexpected error occurred", code = "INTERNAL_SERVER_ERROR" });
            }
        }
    }
}