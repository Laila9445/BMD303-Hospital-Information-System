using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using CLINICSYSTEM.Data;
using CLINICSYSTEM.Data.DTOs;
using CLINICSYSTEM.Models;

namespace CLINICSYSTEM.Services
{
    public class DoctorService : IDoctorService
    {
        private readonly ClinicDbContext _context;
        private readonly IMemoryCache _cache;
        private readonly ILogger<DoctorService> _logger;

        public DoctorService(ClinicDbContext context, IMemoryCache cache, ILogger<DoctorService> logger)
        {
            _context = context;
            _cache = cache;
            _logger = logger;
        }

        public async Task<int?> GetDoctorIdByUserIdAsync(int userId)
        {
            var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == userId);
            return doctor?.DoctorId;
        }

        public async Task<List<DoctorListDTO>> GetAllDoctorsAsync()
        {
            return await _context.Doctors
                .Include(d => d.User)
                .Select(d => new DoctorListDTO
                {
                    DoctorId = d.DoctorId,
                    FirstName = d.User.FirstName,
                    LastName = d.User.LastName,
                    Specialization = d.Specialization,
                    Email = d.User.Email,
                    PhoneNumber = d.User.PhoneNumber
                })
                .ToListAsync();
        }

        /// <summary>Single clinic orthopedics physician for patient self-booking (Dr. Ahmed Nabil).</summary>
        public async Task<List<DoctorListDTO>> GetPatientBookableDoctorsAsync()
        {
            const string preferredEmail = "dr.ahmed.nabil@clinic.com";

            var doctors = await _context.Doctors
                .Include(d => d.User)
                .Where(d => d.IsActive && d.User.Role == "Doctor")
                .ToListAsync();

            var preferred = doctors.FirstOrDefault(d =>
                string.Equals(d.User.Email, preferredEmail, StringComparison.OrdinalIgnoreCase));
            if (preferred != null)
            {
                return new List<DoctorListDTO> { MapDoctorList(preferred) };
            }

            var ahmedNabil = doctors
                .Where(d =>
                    string.Equals(d.User.FirstName, "Ahmed", StringComparison.OrdinalIgnoreCase) &&
                    string.Equals(d.User.LastName, "Nabil", StringComparison.OrdinalIgnoreCase))
                .OrderByDescending(d => d.DoctorId)
                .FirstOrDefault();

            if (ahmedNabil != null)
            {
                return new List<DoctorListDTO> { MapDoctorList(ahmedNabil) };
            }

            var ortho = doctors
                .Where(d => (d.Specialization ?? "").Contains("Orthoped", StringComparison.OrdinalIgnoreCase))
                .OrderBy(d => d.DoctorId)
                .FirstOrDefault();

            return ortho != null
                ? new List<DoctorListDTO> { MapDoctorList(ortho) }
                : new List<DoctorListDTO>();
        }

        private static DoctorListDTO MapDoctorList(DoctorModel d) => new()
        {
            DoctorId = d.DoctorId,
            FirstName = d.User.FirstName,
            LastName = d.User.LastName,
            Specialization = d.Specialization,
            Email = d.User.Email,
            PhoneNumber = d.User.PhoneNumber
        };

        public async Task<DoctorProfileDTO?> GetProfileAsync(int userId)
        {
            var cacheKey = $"doctor_profile_{userId}";
            
            if (_cache.TryGetValue(cacheKey, out DoctorProfileDTO? cachedProfile))
            {
                _logger.LogInformation("Retrieved doctor profile from cache for UserId: {UserId}", userId);
                return cachedProfile;
            }

            var doctor = await _context.Doctors
                .Include(d => d.User)
                .FirstOrDefaultAsync(d => d.UserId == userId);

            if (doctor?.User == null) return null;

            var profile = new DoctorProfileDTO
            {
                DoctorId = doctor.DoctorId,
                FirstName = doctor.User.FirstName,
                LastName = doctor.User.LastName,
                Email = doctor.User.Email,
                PhoneNumber = doctor.User.PhoneNumber,
                Specialization = doctor.Specialization,
                LicenseNumber = doctor.LicenseNumber
            };

            _cache.Set(cacheKey, profile, TimeSpan.FromMinutes(30));
            _logger.LogInformation("Cached doctor profile for UserId: {UserId}", userId);

            return profile;
        }

        public async Task<bool> UpdateProfileAsync(int userId, UpdateDoctorProfileRequest request)
        {
            var doctor = await _context.Doctors
                .Include(d => d.User)
                .FirstOrDefaultAsync(d => d.UserId == userId);

            if (doctor == null) return false;

            doctor.Specialization = request.Specialization;
            doctor.LicenseNumber = request.LicenseNumber;
            doctor.UpdatedAt = DateTime.UtcNow;

            if (doctor.User != null)
            {
                doctor.User.FirstName = request.FirstName;
                doctor.User.LastName = request.LastName;
                doctor.User.PhoneNumber = request.PhoneNumber;
                doctor.User.UpdatedAt = DateTime.UtcNow;
            }

            _context.Doctors.Update(doctor);
            await _context.SaveChangesAsync();

            // Clear cache
            _cache.Remove($"doctor_profile_{userId}");

            return true;
        }

        public async Task<List<DayAppointmentDTO>> GetTodayAppointmentsAsync(int doctorId)
        {
            var today = DateTime.UtcNow.Date;
            return await GetAppointmentsAsync(doctorId, today);
        }

        public async Task<List<DayAppointmentDTO>> GetAppointmentsAsync(int doctorId, DateTime date)
{
    var targetDate = date.Date;

    var dayStart = targetDate;
    var dayEnd = targetDate.AddDays(1);

    var appointments = await _context.Appointments
        .Include(a => a.Patient)
        .Include(a => a.TimeSlot)
        .Where(a => a.DoctorId == doctorId
            && a.TimeSlot != null
            && a.TimeSlot.SlotDate >= dayStart
            && a.TimeSlot.SlotDate < dayEnd)
        .Select(a => new DayAppointmentDTO
        {
            AppointmentId = a.AppointmentId,
            PatientName = a.Patient != null ? a.Patient.FullName : "Unknown Patient",
            AppointmentDate = a.TimeSlot.SlotDate,
            StartTime = a.TimeSlot.StartTime,
            EndTime = a.TimeSlot.EndTime,
            Status = a.Status,
            ReasonForVisit = a.ReasonForVisit
        })
        .ToListAsync();

    return appointments.OrderBy(a => a.StartTime).ToList();
}

        public async Task<PatientRecordDetailDTO?> GetPatientRecordAsync(int patientId)
        {
            var patient = await _context.Patients
                .FirstOrDefaultAsync(p => p.PatientId == patientId);

            if (patient == null) return null;

            var medicalRecord = await _context.MedicalRecords
                .Where(mr => mr.PatientId == patientId)
                .OrderByDescending(mr => mr.LastUpdated)
                .FirstOrDefaultAsync();

            // Parse full name
            var nameParts = patient.FullName.Split(' ', 2);
            var firstName = nameParts.Length > 0 ? nameParts[0] : "";
            var lastName = nameParts.Length > 1 ? nameParts[1] : "";

            return new PatientRecordDetailDTO
            {
                PatientId = patient.PatientId,
                FirstName = firstName,
                LastName = lastName,
                DateOfBirth = DateTime.MinValue, // Not stored in minimal patient model
                Gender = "", // Not stored in minimal patient model
                Allergies = medicalRecord?.Allergies,
                ChronicConditions = medicalRecord?.ChronicConditions,
                CurrentMedications = medicalRecord?.CurrentMedications,
                SurgicalHistory = medicalRecord?.SurgicalHistory,
                FamilyHistory = medicalRecord?.FamilyHistory
            };
        }

        public async Task<List<PatientSearchDTO>> SearchPatientsAsync(string searchTerm)
        {
            var term = searchTerm.Trim();
            var query = _context.Patients
                .Include(p => p.User)
                .AsQueryable();

            if (!string.IsNullOrEmpty(term))
            {
                query = query.Where(p =>
                    p.FullName.Contains(term) ||
                    (p.ExternalPatientId != null && p.ExternalPatientId.Contains(term)) ||
                    (p.PhoneNumber != null && p.PhoneNumber.Contains(term)) ||
                    (p.User != null && (p.User.FirstName.Contains(term) || p.User.LastName.Contains(term) || p.User.Email.Contains(term))));
            }

            var results = await query.OrderBy(p => p.FullName).Take(50).ToListAsync();
            return MapPatientSearchResults(results);
        }

        public async Task<List<PatientSearchDTO>> GetAllPatientsAsync()
        {
            var results = await _context.Patients
                .Include(p => p.User)
                .OrderBy(p => p.FullName)
                .ToListAsync();

            return MapPatientSearchResults(results);
        }

        private static List<PatientSearchDTO> MapPatientSearchResults(List<PatientModel> results)
        {
            return results.Select(p =>
            {
                var first = p.User?.FirstName ?? p.FullName.Split(' ', 2)[0];
                var last = p.User?.LastName ?? (p.FullName.Contains(' ') ? p.FullName.Split(' ', 2)[1] : "");
                return new PatientSearchDTO
                {
                    PatientId = p.PatientId,
                    FirstName = first,
                    LastName = last,
                    Email = p.User?.Email ?? p.ExternalPatientId,
                    PhoneNumber = p.PhoneNumber ?? p.User?.PhoneNumber,
                    DateOfBirth = p.DateOfBirth,
                    Gender = p.Gender
                };
            }).ToList();
        }

        public async Task<List<MedicalImageDTO>> GetPatientMedicalImagesAsync(int patientId)
        {
            return await _context.MedicalImages
                .Where(m => m.PatientId == patientId)
                .OrderByDescending(m => m.DateUploaded)
                .Select(m => new MedicalImageDTO
                {
                    ImageId = m.ImageId,
                    ImageType = m.ImageType,
                    FileName = m.FileName,
                    DateUploaded = m.DateUploaded,
                    FileSizeBytes = m.FileSizeBytes,
                    Description = m.Description
                })
                .ToListAsync();
        }

        public async Task<bool> CreateScheduleAsync(int doctorId, CreateScheduleRequest request)
        {
            try
            {
                // Check if schedule already exists for this doctor and day
                var existingSchedule = await _context.DoctorSchedules
                    .FirstOrDefaultAsync(ds => ds.DoctorId == doctorId && ds.DayOfWeek == request.DayOfWeek);

                if (existingSchedule != null)
                {
                    _logger.LogWarning("Schedule already exists for Doctor {DoctorId} on {DayOfWeek}", doctorId, request.DayOfWeek);
                    return false; // Schedule already exists
                }

                var schedule = new DoctorSchedule
                {
                    DoctorId = doctorId,
                    DayOfWeek = request.DayOfWeek,
                    StartTime = request.StartTimeSpan,  // Use the converted TimeSpan
                    EndTime = request.EndTimeSpan,      // Use the converted TimeSpan
                    SlotDurationMinutes = request.SlotDurationMinutes,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.DoctorSchedules.Add(schedule);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Schedule created for Doctor {DoctorId} on {DayOfWeek}", doctorId, request.DayOfWeek);

                // Generate time slots for this schedule
                await GenerateTimeSlotsForScheduleAsync(schedule);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating schedule for Doctor {DoctorId}", doctorId);
                throw;
            }
        }

        public async Task<List<DoctorScheduleDTO>> GetSchedulesAsync(int doctorId)
        {
            return await _context.DoctorSchedules
                .Where(ds => ds.DoctorId == doctorId)
                .Select(ds => new DoctorScheduleDTO
                {
                    ScheduleId = ds.ScheduleId,
                    DayOfWeek = ds.DayOfWeek,
                    StartTime = ds.StartTime,
                    EndTime = ds.EndTime,
                    SlotDurationMinutes = ds.SlotDurationMinutes
                })
                .ToListAsync();
        }

        public async Task<bool> DeleteScheduleAsync(int scheduleId)
        {
            var schedule = await _context.DoctorSchedules.FindAsync(scheduleId);
            if (schedule == null) return false;

            _context.DoctorSchedules.Remove(schedule);
            await _context.SaveChangesAsync();
            return true;
        }

        private async Task GenerateTimeSlotsForScheduleAsync(DoctorSchedule schedule)
        {
            // Generate time slots for the next 30 days
            var startDate = DateTime.UtcNow.Date;
            
            if (!Enum.TryParse<DayOfWeek>(schedule.DayOfWeek, true, out var targetDayOfWeek))
            {
                _logger.LogWarning("Invalid DayOfWeek in schedule: {DayOfWeek}", schedule.DayOfWeek);
                return;
            }

            for (int i = 0; i < 30; i++)
            {
                var currentDate = startDate.AddDays(i);
                if (currentDate.DayOfWeek == targetDayOfWeek)
                {
                    var currentTime = schedule.StartTime;

                    // Ensure we don't generate snippets that go past EndTime
                    while (currentTime.Add(TimeSpan.FromMinutes(schedule.SlotDurationMinutes)) <= schedule.EndTime)
                    {
                        var slot = new TimeSlotModel
                        {
                            ScheduleId = schedule.ScheduleId,
                            SlotDate = currentDate,
                            StartTime = currentTime,
                            EndTime = currentTime.Add(TimeSpan.FromMinutes(schedule.SlotDurationMinutes)),
                            Status = "Available",
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        };

                        _context.TimeSlots.Add(slot);
                        currentTime = currentTime.Add(TimeSpan.FromMinutes(schedule.SlotDurationMinutes));
                    }
                }
            }

            await _context.SaveChangesAsync();
        }
    }
}
