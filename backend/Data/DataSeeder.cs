using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CLINICSYSTEM.Models;

namespace CLINICSYSTEM.Data
{
    public static class DataSeeder
    {
        private const string DefaultPassword = "Hospital@123!";

        public static async Task SeedAsync(IServiceProvider services)
        {
            using var scope = services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ClinicDbContext>();
            var userMgr = scope.ServiceProvider.GetRequiredService<UserManager<UserModel>>();
            var roleMgr = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<int>>>();

            // Apply migrations
            await db.Database.MigrateAsync();

            await SeedRolesAsync(roleMgr);
            await SeedUsersAsync(userMgr, db);
            await SeedBillingServicesAsync(db);
            await SeedNotificationTypesAsync(db);
            await EnsureDoctorProfilesAsync(db);
            await NormalizeOrthopedicsDoctorAsync(db);
            await SeedSchedulesAndTimeSlotsAsync(db);
            await BackfillAppointmentDoctorIdsAsync(db);

            Console.WriteLine("✅  Seed complete. Login with password: " + DefaultPassword);
        }

        private static async Task SeedRolesAsync(RoleManager<IdentityRole<int>> roleMgr)
        {
            string[] roles = new[] { "Admin", "Doctor", "Patient", "Nurse", "Radiologist", "Physiotherapist" };
            foreach (var role in roles)
            {
                if (!await roleMgr.RoleExistsAsync(role))
                {
                    var r = new IdentityRole<int> { Name = role };
                    await roleMgr.CreateAsync(r);
                    Console.WriteLine($"  ➕ Role created: {role}");
                }
            }
        }

        private static async Task SeedUsersAsync(UserManager<UserModel> userMgr, ClinicDbContext db)
        {
            // Admin
            await CreateUser(userMgr, new UserModel
            {
                UserName = "admin@hospital.com",
                Email = "admin@hospital.com",
                FirstName = "System",
                LastName = "Admin",
                PhoneNumber = "0100000001",
                EmailConfirmed = true,
                Role = "Admin",
                CreatedAt = DateTime.UtcNow
            }, "Admin");

            // Doctors
            var doctorSeeds = new[]
            {
                new { Email = "dr.ahmed.nabil@clinic.com", First = "Ahmed", Last = "Nabil", Phone = "0100000002", Specialty = "Orthopedics", License = "ORT-2024-001" },
                new { Email = "dr.sara@hospital.com",  First = "Sara",  Last = "Ali",    Phone = "0100000003", Specialty = "Radiology", License = "RAD-2024-002" },
                new { Email = "dr.khalid@hospital.com",First = "Khalid", Last = "Omar",   Phone = "0100000004", Specialty = "Physiotherapy", License = "PHY-2024-003" }
            };

            foreach (var d in doctorSeeds)
            {
                var role = d.Specialty == "Radiology" ? "Radiologist" : d.Specialty == "Physiotherapy" ? "Physiotherapist" : "Doctor";
                var user = await CreateUser(userMgr, new UserModel
                {
                    UserName = d.Email,
                    Email = d.Email,
                    FirstName = d.First,
                    LastName = d.Last,
                    PhoneNumber = d.Phone,
                    EmailConfirmed = true,
                    Role = role,
                    CreatedAt = DateTime.UtcNow
                }, role);

                if (user != null && !db.Doctors.Any(x => x.UserId == user.Id))
                {
                    db.Doctors.Add(new DoctorModel
                    {
                        UserId = user.Id,
                        Specialization = d.Specialty,
                        LicenseNumber = d.License,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    });
                }
            }

            // Nurse
            var nurseUser = await CreateUser(userMgr, new UserModel
            {
                UserName = "nurse.fatima@hospital.com",
                Email = "nurse.fatima@hospital.com",
                FirstName = "Fatima",
                LastName = "Nour",
                PhoneNumber = "0100000005",
                EmailConfirmed = true,
                Role = "Nurse",
                CreatedAt = DateTime.UtcNow
            }, "Nurse");

            if (nurseUser != null && !db.Nurses.Any(x => x.UserId == nurseUser.Id))
            {
                db.Nurses.Add(new NurseModel
                {
                    UserId = nurseUser.Id,
                    Department = "General Ward",
                    HireDate = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow
                });
            }

            // Patients (Egyptian names & mobile numbers)
            var patientSeeds = new[]
            {
                new { Email = "mohamed.hassan@mail.com", First = "Mohamed", Last = "Hassan", Phone = "01012345678", DOB = "1985-03-12", Gender = "Male", City = "Cairo" },
                new { Email = "fatma.ali@mail.com", First = "Fatma", Last = "Ali", Phone = "01023456789", DOB = "1992-07-22", Gender = "Female", City = "Giza" },
                new { Email = "omar.khaled@mail.com", First = "Omar", Last = "Khaled", Phone = "01034567890", DOB = "1978-11-05", Gender = "Male", City = "Alexandria" },
                new { Email = "sara.mahmoud@mail.com", First = "Sara", Last = "Mahmoud", Phone = "01045678901", DOB = "1995-01-18", Gender = "Female", City = "Cairo" },
                new { Email = "youssef.ibrahim@mail.com", First = "Youssef", Last = "Ibrahim", Phone = "01056789012", DOB = "1988-09-30", Gender = "Male", City = "Mansoura" },
                new { Email = "nour.eldin@mail.com", First = "Nour", Last = "El-Din", Phone = "01067890123", DOB = "2001-04-08", Gender = "Female", City = "Tanta" },
                new { Email = "karim.mostafa@mail.com", First = "Karim", Last = "Mostafa", Phone = "01078901234", DOB = "1990-12-14", Gender = "Male", City = "Cairo" },
                new { Email = "layla.saad@mail.com", First = "Layla", Last = "Saad", Phone = "01089012345", DOB = "1983-06-25", Gender = "Female", City = "Luxor" },
                new { Email = "hassan.farouk@mail.com", First = "Hassan", Last = "Farouk", Phone = "01090123456", DOB = "1975-02-11", Gender = "Male", City = "Aswan" },
                new { Email = "mariam.nabil@mail.com", First = "Mariam", Last = "Nabil", Phone = "01101234567", DOB = "1998-08-03", Gender = "Female", City = "Cairo" },
                new { Email = "tarek.adel@mail.com", First = "Tarek", Last = "Adel", Phone = "01112345678", DOB = "1987-05-19", Gender = "Male", City = "Giza" },
                new { Email = "dina.rashad@mail.com", First = "Dina", Last = "Rashad", Phone = "01123456789", DOB = "1993-10-27", Gender = "Female", City = "Alexandria" },
                new { Email = "amr.salem@mail.com", First = "Amr", Last = "Salem", Phone = "01134567890", DOB = "1980-03-16", Gender = "Male", City = "Cairo" },
                new { Email = "heba.ashraf@mail.com", First = "Heba", Last = "Ashraf", Phone = "01145678901", DOB = "1996-12-01", Gender = "Female", City = "Port Said" },
                new { Email = "mahmoud.gamal@mail.com", First = "Mahmoud", Last = "Gamal", Phone = "01156789012", DOB = "1972-07-09", Gender = "Male", City = "Cairo" },
                new { Email = "rania.hosny@mail.com", First = "Rania", Last = "Hosny", Phone = "01167890123", DOB = "1991-04-22", Gender = "Female", City = "Giza" },
                new { Email = "khaled.abbas@mail.com", First = "Khaled", Last = "Abbas", Phone = "01178901234", DOB = "1986-11-30", Gender = "Male", City = "Cairo" },
                new { Email = "yasmin.fawzy@mail.com", First = "Yasmin", Last = "Fawzy", Phone = "01189012345", DOB = "1999-02-14", Gender = "Female", City = "Alexandria" },
                new { Email = "sherif.nagy@mail.com", First = "Sherif", Last = "Nagy", Phone = "01190123456", DOB = "1984-09-07", Gender = "Male", City = "Cairo" },
                new { Email = "nada.emad@mail.com", First = "Nada", Last = "Emad", Phone = "01201234567", DOB = "1994-06-18", Gender = "Female", City = "Giza" }
            };

            foreach (var p in patientSeeds)
            {
                var user = await CreateUser(userMgr, new UserModel
                {
                    UserName = p.Email,
                    Email = p.Email,
                    FirstName = p.First,
                    LastName = p.Last,
                    PhoneNumber = p.Phone,
                    EmailConfirmed = true,
                    Role = "Patient",
                    CreatedAt = DateTime.UtcNow
                }, "Patient");

                if (user != null && !db.Patients.Any(x => x.UserId == user.Id))
                {
                    db.Patients.Add(new PatientModel
                    {
                        UserId = user.Id,
                        DateOfBirth = DateTime.Parse(p.DOB),
                        Gender = p.Gender,
                        Address = $"{p.City}, Egypt",
                        PhoneNumber = p.Phone,
                        FullName = $"{p.First} {p.Last}",
                        ExternalPatientId = $"TEMP-{user.Id}",
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    });
                }
            }

            await db.SaveChangesAsync();

            foreach (var patient in db.Patients.Where(p => p.ExternalPatientId.StartsWith("TEMP-")).ToList())
            {
                patient.ExternalPatientId = $"PAT-{patient.PatientId}";
                patient.UpdatedAt = DateTime.UtcNow;
            }

            await db.SaveChangesAsync();
        }

        private static async Task SeedSchedulesAndTimeSlotsAsync(ClinicDbContext db)
        {
            var doctors = await db.Doctors.ToListAsync();
            var weekdays = new[] { "Monday", "Tuesday", "Wednesday", "Thursday", "Friday" };
            var schedulesTouched = 0;

            foreach (var doctor in doctors)
            {
                foreach (var dayName in weekdays)
                {
                    var schedule = await db.DoctorSchedules
                        .FirstOrDefaultAsync(s => s.DoctorId == doctor.DoctorId && s.DayOfWeek == dayName);

                    if (schedule == null)
                    {
                        schedule = new DoctorSchedule
                        {
                            DoctorId = doctor.DoctorId,
                            DayOfWeek = dayName,
                            StartTime = new TimeSpan(9, 0, 0),
                            EndTime = new TimeSpan(17, 0, 0),
                            SlotDurationMinutes = 30,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        };
                        db.DoctorSchedules.Add(schedule);
                        await db.SaveChangesAsync();
                    }

                    await GenerateSlotsForScheduleAsync(db, schedule);
                    schedulesTouched++;
                }
            }

            await db.SaveChangesAsync();
            Console.WriteLine($"  ➕ Ensured Mon–Fri schedules and slots for {doctors.Count} doctor(s) ({schedulesTouched} schedule rows).");
        }

        private static async Task GenerateSlotsForScheduleAsync(ClinicDbContext db, DoctorSchedule schedule)
        {
            if (!Enum.TryParse<DayOfWeek>(schedule.DayOfWeek, true, out var targetDayOfWeek))
            {
                return;
            }

            var startDate = DateTime.UtcNow.Date;
            for (int i = 0; i < 42; i++)
            {
                var currentDate = startDate.AddDays(i);
                if (currentDate.DayOfWeek != targetDayOfWeek)
                {
                    continue;
                }

                var currentTime = schedule.StartTime;
                while (currentTime.Add(TimeSpan.FromMinutes(schedule.SlotDurationMinutes)) <= schedule.EndTime)
                {
                    var exists = await db.TimeSlots.AnyAsync(ts =>
                        ts.ScheduleId == schedule.ScheduleId &&
                        ts.SlotDate == currentDate &&
                        ts.StartTime == currentTime);

                    if (!exists)
                    {
                        db.TimeSlots.Add(new TimeSlotModel
                        {
                            ScheduleId = schedule.ScheduleId,
                            SlotDate = currentDate,
                            StartTime = currentTime,
                            EndTime = currentTime.Add(TimeSpan.FromMinutes(schedule.SlotDurationMinutes)),
                            Status = "Available",
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        });
                    }

                    currentTime = currentTime.Add(TimeSpan.FromMinutes(schedule.SlotDurationMinutes));
                }
            }
        }

        /// <summary>Creates a Doctors row for any User with role Doctor who is missing one (e.g. manual registration).</summary>
        private static async Task EnsureDoctorProfilesAsync(ClinicDbContext db)
        {
            var doctorUsers = await db.Users.Where(u => u.Role == "Doctor").ToListAsync();
            var created = 0;

            foreach (var user in doctorUsers)
            {
                if (await db.Doctors.AnyAsync(d => d.UserId == user.Id))
                {
                    continue;
                }

                db.Doctors.Add(new DoctorModel
                {
                    UserId = user.Id,
                    Specialization = "Orthopedics",
                    LicenseNumber = $"ORT-{user.Id:D4}",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                });
                created++;
            }

            if (created > 0)
            {
                await db.SaveChangesAsync();
                Console.WriteLine($"  ➕ Created {created} missing doctor profile(s) for Doctor-role users.");
            }
        }

        private static async Task NormalizeOrthopedicsDoctorAsync(ClinicDbContext db)
        {
            var emails = new[] { "dr.ahmed.nabil@clinic.com", "dr.ahmed1.nabil@clinic.com" };
            var users = await db.Users.Where(u => emails.Contains(u.Email)).ToListAsync();

            foreach (var user in users)
            {
                user.FirstName = "Ahmed";
                user.LastName = "Nabil";
                user.Role = "Doctor";
                user.UpdatedAt = DateTime.UtcNow;

                var doctor = await db.Doctors.FirstOrDefaultAsync(d => d.UserId == user.Id);
                if (doctor != null)
                {
                    doctor.Specialization = "Orthopedics";
                    doctor.UpdatedAt = DateTime.UtcNow;
                }
            }

            if (users.Count > 0)
            {
                await db.SaveChangesAsync();
                Console.WriteLine($"  ➕ Normalized {users.Count} Ahmed Nabil orthopedics account(s).");
            }
        }

        private static async Task BackfillAppointmentDoctorIdsAsync(ClinicDbContext db)
        {
            var missingDoctor = await db.Appointments
                .Include(a => a.TimeSlot!)
                .ThenInclude(ts => ts.Schedule)
                .Where(a => a.DoctorId == 0)
                .ToListAsync();

            if (missingDoctor.Count == 0)
            {
                return;
            }

            foreach (var appointment in missingDoctor)
            {
                var doctorId = appointment.TimeSlot?.Schedule?.DoctorId;
                if (doctorId is > 0)
                {
                    appointment.DoctorId = doctorId.Value;
                    appointment.UpdatedAt = DateTime.UtcNow;
                }
            }

            await db.SaveChangesAsync();
            Console.WriteLine($"  ➕ Backfilled DoctorId on {missingDoctor.Count} appointment(s).");
        }

        private static async Task SeedBillingServicesAsync(ClinicDbContext db)
        {
            if (db.BillingServices.Any()) return;

            var services = new List<BillingService>
            {
                new BillingService { Id = Guid.NewGuid().ToString(), ServiceName = "General Consultation", Department = "Consultation", Price = 200m, Status = "Active", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new BillingService { Id = Guid.NewGuid().ToString(), ServiceName = "X-Ray", Department = "Radiology", Price = 350m, Status = "Active", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new BillingService { Id = Guid.NewGuid().ToString(), ServiceName = "MRI Scan", Department = "Radiology", Price = 1200m, Status = "Active", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
            };

            db.BillingServices.AddRange(services);
            await db.SaveChangesAsync();
            Console.WriteLine($"  ➕ {services.Count} billing services seeded.");
        }

        private static async Task SeedNotificationTypesAsync(ClinicDbContext db)
        {
            await Task.CompletedTask;
        }

        private static async Task<UserModel?> CreateUser(UserManager<UserModel> userMgr, UserModel user, string role)
        {
            var existing = await userMgr.FindByEmailAsync(user.Email);
            if (existing != null) return existing;

            user.Role = role;
            var result = await userMgr.CreateAsync(user, DefaultPassword);
            if (!result.Succeeded)
            {
                Console.WriteLine($"  ⚠️  Failed to create {user.Email}: {string.Join(", ", result.Errors.Select(e => e.Description))}");
                return null;
            }

            await userMgr.AddToRoleAsync(user, role);
            Console.WriteLine($"  ✅  Created [{role}] {user.Email}");
            return user;
        }

        // ❌ COMMENTED OUT - Models & DbSets don't exist yet
        // Uncomment this AFTER creating:
        // 1. CarePlanModel.cs
        // 2. ConditionModel.cs  
        // 3. ReferralModel.cs
        // 4. Add DbSet<CarePlanModel> CarePlans { get; set; }
        // 5. Add DbSet<ConditionModel> Conditions { get; set; }
        // 6. Add DbSet<ReferralModel> Referrals { get; set; }
        // to ClinicDbContext.cs
        /*
        private static async Task SeedClinicalDataAsync(ClinicDbContext db)
        {
            // Prevent duplicate seeding
            if (db.CarePlans.Any() || db.Conditions.Any() || db.Referrals.Any())
                return;

            var patient = db.Patients.FirstOrDefault();
            var doctor = db.Doctors.FirstOrDefault();

            if (patient == null || doctor == null)
                return;

            // ---------------------------
            // 1. CarePlan (IMPORTANT)
            // ---------------------------
            db.CarePlans.Add(new CarePlanModel
            {
                PatientId = patient.PatientId,
                Status = "active",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });

            // ---------------------------
            // 2. Condition (IMPORTANT)
            // ---------------------------
            db.Conditions.Add(new ConditionModel
            {
                ConsultationId = 7,   // this is IMPORTANT for your FHIR endpoint
                PatientId = patient.PatientId,
                Diagnosis = "Chest pain",
                CreatedAt = DateTime.UtcNow
            });

            // ---------------------------
            // 3. Referral (ServiceRequest)
            // ---------------------------
            db.Referrals.Add(new ReferralModel
            {
                PatientId = patient.PatientId,
                DoctorId = doctor.DoctorId,
                Status = "Pending",
                ReferralType = "radiology-xray",
                Department = "Radiology",
                Urgency = "Urgent",
                Reason = "Chest pain",
                Notes = "Test referral for FHIR",
                CreatedDate = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });

            await db.SaveChangesAsync();

            Console.WriteLine("✅ Clinical FHIR data seeded");
        }
        */
    }
}