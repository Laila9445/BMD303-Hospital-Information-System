using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using CLINICSYSTEM.Data.DTOs;
using CLINICSYSTEM.Services;

namespace CLINICSYSTEM.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Patient")]
    public class MedicalImagesController : ControllerBase
    {
        private readonly IMedicalImageService _medicalImageService;

        public MedicalImagesController(IMedicalImageService medicalImageService)
        {
            _medicalImageService = medicalImageService;
        }

        private int GetPatientId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            return userIdClaim != null && int.TryParse(userIdClaim.Value, out var id) ? id : 0;
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadImage([FromForm] UploadMedicalImageRequest request)
        {
            var patientId = GetPatientId();
            if (patientId == 0) return Unauthorized();

            if (request.File == null || request.File.Length == 0)
                return BadRequest("No file provided");

            var image = await _medicalImageService.UploadImageAsync(patientId, request);
            if (image == null) return BadRequest("Failed to upload image");

            return Ok(image);
        }

        [HttpGet]
        public async Task<IActionResult> GetMyImages()
        {
            var patientId = GetPatientId();
            if (patientId == 0) return Unauthorized();

            var images = await _medicalImageService.GetPatientImagesAsync(patientId);
            return Ok(images);
        }

        [HttpGet("{imageId}/download")]
        public async Task<IActionResult> DownloadImage([FromRoute] int imageId)
        {
            var imageBytes = await _medicalImageService.DownloadImageAsync(imageId);
            if (imageBytes == null) return NotFound();

            return File(imageBytes, "application/octet-stream", $"image_{imageId}");
        }

        [HttpDelete("{imageId}")]
        public async Task<IActionResult> DeleteImage([FromRoute] int imageId)
        {
            var result = await _medicalImageService.DeleteImageAsync(imageId);
            if (!result) return NotFound();

            return Ok(new { message = "Image deleted successfully" });
        }
    }
}
