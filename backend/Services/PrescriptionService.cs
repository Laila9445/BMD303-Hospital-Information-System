using Microsoft.EntityFrameworkCore;
using CLINICSYSTEM.Data;
using CLINICSYSTEM.Data.DTOs;
using CLINICSYSTEM.Models;

namespace CLINICSYSTEM.Services
{
    public class PrescriptionService : IPrescriptionService
    {
        private readonly ClinicDbContext _context;
        private readonly PdfService _pdfService;
        private readonly INotificationService _notificationService;

        public PrescriptionService(ClinicDbContext context, PdfService pdfService, INotificationService notificationService)
        {
            _context = context;
            _pdfService = pdfService;
            _notificationService = notificationService;
        }

        public async Task<PrescriptionDTO?> CreatePrescriptionAsync(CreatePrescriptionRequest request)
        {
            // CHECK IF CONSULTATION EXISTS
            var consultationExists = await _context.Consultations
                .AnyAsync(c => c.ConsultationId == request.ConsultationId);

            if (!consultationExists)
            {
                throw new KeyNotFoundException(
                    $"Consultation with ID {request.ConsultationId} not found.");
            }

            var prescription = new PrescriptionModel
            {
                ConsultationId = request.ConsultationId,
                MedicationName = request.MedicationName,
                Dosage = request.Dosage,
                Frequency = request.Frequency,
                DurationDays = request.DurationDays,
                Instructions = request.Instructions,
                Warnings = request.Warnings,
                Status = "Active",
                CreatedAt = DateTime.UtcNow
            };

            _context.Prescriptions.Add(prescription);
            await _context.SaveChangesAsync();

            return await GetPrescriptionDetailsAsync(prescription.PrescriptionId);
        }

        public async Task<List<PrescriptionDTO>> CreateBulkPrescriptionsAsync(BulkPrescriptionRequest request)
        {
            // CHECK IF CONSULTATION EXISTS
            var consultationExists = await _context.Consultations
                .AnyAsync(c => c.ConsultationId == request.ConsultationId);

            if (!consultationExists)
            {
                throw new KeyNotFoundException(
                    $"Consultation with ID {request.ConsultationId} not found.");
            }

            var prescriptions = new List<PrescriptionDTO>();

            foreach (var item in request.Prescriptions)
            {
                var prescription = new PrescriptionModel
                {
                    ConsultationId = request.ConsultationId,
                    MedicationName = item.MedicationName,
                    Dosage = item.Dosage,
                    Frequency = item.Frequency,
                    DurationDays = item.DurationDays,
                    Instructions = item.Instructions,
                    Warnings = item.Warnings,
                    Status = "Active",
                    CreatedAt = DateTime.UtcNow
                };

                _context.Prescriptions.Add(prescription);
                await _context.SaveChangesAsync();

                var dto = await GetPrescriptionDetailsAsync(prescription.PrescriptionId);
                if (dto != null) prescriptions.Add(dto);
            }

            return prescriptions;
        }

        public async Task<List<PatientPrescriptionDTO>> GetPatientPrescriptionsAsync(int patientId)
        {
            return await _context.Prescriptions
                .Include(p => p.Consultation)
                    .ThenInclude(c => c.Appointment)
                .Where(p => p.Consultation.Appointment.PatientId == patientId)
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new PatientPrescriptionDTO
                {
                    PrescriptionId = p.PrescriptionId,
                    DateIssued = p.CreatedAt,
                    MedicationName = p.MedicationName,
                    Dosage = p.Dosage,
                    Frequency = p.Frequency,
                    DurationDays = p.DurationDays,
                    Status = p.Status
                })
                .ToListAsync();
        }

        public async Task<byte[]?> GeneratePrescriptionPdfAsync(int prescriptionId)
        {
            var prescription = await _context.Prescriptions
                .Include(p => p.Consultation)
                    .ThenInclude(c => c.Appointment)
                        .ThenInclude(a => a.Doctor)
                            .ThenInclude(d => d.User)
                .Include(p => p.Consultation)
                    .ThenInclude(c => c.Appointment)
                        .ThenInclude(a => a.Patient)
                .FirstOrDefaultAsync(p => p.PrescriptionId == prescriptionId);

            if (prescription?.Consultation?.Appointment == null) return null;

            var patient = prescription.Consultation.Appointment.Patient;
            var doctor = prescription.Consultation.Appointment.Doctor;

            if (patient == null || doctor == null) return null;

            // Generate PDF with available patient data
            var pdfBytes = _pdfService.GeneratePrescriptionPdf(
                prescription,
                patient,
                doctor,
                prescription.Consultation);

            prescription.PdfGeneratedAt = DateTime.UtcNow;
            _context.Prescriptions.Update(prescription);
            await _context.SaveChangesAsync();

            return pdfBytes;
        }

        public async Task<bool> SendPrescriptionToPatientAsync(int prescriptionId)
        {
            var prescription = await _context.Prescriptions
                .Include(p => p.Consultation)
                    .ThenInclude(c => c!.Appointment)
                    .ThenInclude(a => a!.Doctor)
                    .ThenInclude(d => d!.User)
                .FirstOrDefaultAsync(p => p.PrescriptionId == prescriptionId);

            if (prescription?.Consultation?.Appointment?.PatientId == null)
            {
                return false;
            }

            var doctorName = prescription.Consultation.Appointment.Doctor?.User != null
                ? $"{prescription.Consultation.Appointment.Doctor.User.FirstName} {prescription.Consultation.Appointment.Doctor.User.LastName}"
                : "Doctor";

            await _notificationService.CreateNotificationAsync(
                prescription.Consultation.Appointment.PatientId.Value,
                new CreateNotificationRequest
                {
                    Title = "New Prescription",
                    Message = $"Dr. {doctorName} sent you a prescription for {prescription.MedicationName}",
                    Type = "Prescription"
                });

            prescription.Status = "Sent";
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<PrescriptionDTO?> GetPrescriptionDetailsAsync(int prescriptionId)
        {
            return await _context.Prescriptions
                .Where(p => p.PrescriptionId == prescriptionId)
                .Select(p => new PrescriptionDTO
                {
                    PrescriptionId = p.PrescriptionId,
                    ConsultationId = p.ConsultationId,
                    MedicationName = p.MedicationName,
                    Dosage = p.Dosage,
                    Frequency = p.Frequency,
                    DurationDays = p.DurationDays,
                    Instructions = p.Instructions,
                    Warnings = p.Warnings,
                    Status = p.Status
                })
                .FirstOrDefaultAsync();
        }
    }
}