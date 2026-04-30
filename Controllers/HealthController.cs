using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Billing_Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HealthController : ControllerBase
    {
        private readonly ILogger<HealthController> _logger;

        public HealthController(ILogger<HealthController> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// Health check endpoint - no authentication required
        /// </summary>
        [HttpGet("status")]
        [AllowAnonymous]
        public ActionResult<object> GetStatus()
        {
            _logger.LogInformation("Health check requested");

            return Ok(new
            {
                status = "healthy",
                timestamp = DateTime.UtcNow,
                service = "Billing Backend",
                version = "1.0.0",
                environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production"
            });
        }

        /// <summary>
        /// Detailed health information
        /// </summary>
        [HttpGet("info")]
        [AllowAnonymous]
        public ActionResult<object> GetInfo()
        {
            _logger.LogInformation("Info requested");

            return Ok(new
            {
                application = "Billing Backend API",
                version = "1.0.0",
                framework = ".NET 8.0",
                features = new[]
                {
                    "Invoice Management",
                    "Payment Processing",
                    "Service Event Handling",
                    "Patient Summaries",
                    "JWT Authentication",
                    "Comprehensive Logging"
                },
                endpoints = new
                {
                    swagger = "/swagger",
                    health = "/api/health/status",
                    billing = "/api/billing",
                    documentation = "See README.md"
                }
            });
        }
    }
}
