using CLINICSYSTEM.Models;

namespace CLINICSYSTEM.Services
{
    /// <summary>
    /// PDF Service stub - QuestPDF disabled for course project
    /// </summary>
    public class PdfService
    {
        private readonly ILogger<PdfService> _logger;

        public PdfService(ILogger<PdfService> logger)
        {
            _logger = logger;
        }

        public byte[] GeneratePrescriptionPdf(PrescriptionModel prescription, 
            PatientModel patient, 
            DoctorModel doctor,
            ConsultationModel consultation)
        {
            _logger.LogInformation("PDF generation disabled for course project");
            return Array.Empty<byte>();
        }
    }
}
