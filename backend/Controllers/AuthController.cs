using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CLINICSYSTEM.Data.DTOs;
using CLINICSYSTEM.Services;
using FluentValidation;

namespace CLINICSYSTEM.Controllers
{
    /// <summary>
    /// Authentication and authorization endpoints for Clinic System
    /// Only manages Doctor, Admin, and Staff authentication
    /// Patient authentication is handled by the Patient Portal microservice
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthenticationService _authService;
        private readonly IValidator<RegisterRequest> _registerValidator;
        private readonly IValidator<LoginRequest> _loginValidator;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            IAuthenticationService authService,
            IValidator<RegisterRequest> registerValidator,
            IValidator<LoginRequest> loginValidator,
            ILogger<AuthController> logger)
        {
            _authService = authService;
            _registerValidator = registerValidator;
            _loginValidator = loginValidator;
            _logger = logger;
        }

        /// <summary>
        /// Register a new clinic user (Doctor, Admin, or Staff only)
        /// Patient registration is handled by the Patient Portal service
        /// </summary>
        /// <param name="request">Registration details including role</param>
        /// <returns>JWT token and user information</returns>
        /// <response code="200">Registration successful</response>
        /// <response code="400">Invalid input or email already exists</response>
        [HttpPost("register")]
        [ProducesResponseType(typeof(AuthResponse), 200)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            try
            {
                if (request == null)
                {
                    return BadRequest(new AuthResponse { Success = false, Message = "Request body is required" });
                }

                // Validate request
                var validationResult = await _registerValidator.ValidateAsync(request);
                if (!validationResult.IsValid)
                {
                    var errors = string.Join("; ", validationResult.Errors.Select(e => e.ErrorMessage));
                    _logger.LogWarning("Registration validation failed: {Errors}", errors);
                    return BadRequest(new AuthResponse { Success = false, Message = errors });
                }

                var result = await _authService.RegisterAsync(request);
                
                if (!result.Success)
                {
                    _logger.LogWarning("Registration failed for {Email}: {Message}", request.Email, result.Message);
                    return BadRequest(result);
                }

                _logger.LogInformation("User {Email} registered successfully", request.Email);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Registration error for email {Email}", request?.Email);
                return StatusCode(500, new AuthResponse 
                { 
                    Success = false, 
                    Message = "Internal server error occurred during registration" 
                });
            }
        }

        /// <summary>
        /// Login with email and password
        /// </summary>
        /// <param name="request">Login credentials</param>
        /// <returns>JWT token and user information</returns>
        /// <response code="200">Login successful</response>
        /// <response code="401">Invalid credentials</response>
        [HttpPost("login")]
        [ProducesResponseType(typeof(AuthResponse), 200)]
        [ProducesResponseType(401)]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                if (request == null)
                {
                    return BadRequest(new AuthResponse { Success = false, Message = "Request body is required" });
                }

                // Validate request
                var validationResult = await _loginValidator.ValidateAsync(request);
                if (!validationResult.IsValid)
                {
                    var errors = string.Join("; ", validationResult.Errors.Select(e => e.ErrorMessage));
                    return BadRequest(new AuthResponse { Success = false, Message = errors });
                }

                var result = await _authService.LoginAsync(request);
                
                if (!result.Success)
                {
                    return Unauthorized(result);
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Login error for email {Email}", request?.Email);
                return StatusCode(500, new AuthResponse 
                { 
                    Success = false, 
                    Message = "Internal server error occurred during login" 
                });
            }
        }

        /// <summary>
        /// Get current user profile
        /// </summary>
        /// <returns>Current user information</returns>
        [Authorize]
        [HttpGet("profile")]
        [ProducesResponseType(200)]
        [ProducesResponseType(401)]
        public IActionResult GetProfile()
        {
            try
            {
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
                if (userIdClaim == null) 
                {
                    return Unauthorized(new { message = "User not found" });
                }

                var emailClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Email);
                var nameClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Name);
                var roleClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Role);

                return Ok(new 
                { 
                    userId = userIdClaim.Value,
                    email = emailClaim?.Value,
                    name = nameClaim?.Value,
                    role = roleClaim?.Value
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user profile");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }
    }
}
