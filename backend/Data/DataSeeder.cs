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
            // ❌ REMOVED: await SeedClinicalDataAsync(db); 
            // Models don't exist - uncomment after creating CarePlanModel, ConditionModel, ReferralModel

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
                new { Email = "dr.ahmed@hospital.com", First = "Ahmed", Last = "Hassan", Phone = "0100000002", Specialty = "General Practice", License = "GP-2024-001" },
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

            // Patients
            var patientSeeds = new[]
            {
                new { Email = "patient.john@mail.com", First = "John", Last = "Doe", Phone = "0200000001", DOB = "1990-05-15" },
                new { Email = "patient.mona@mail.com", First = "Mona", Last = "Saeed", Phone = "0200000002", DOB = "1985-11-22" },
                new { Email = "patient.omar@mail.com", First = "Omar", Last = "Khaled", Phone = "0200000003", DOB = "2000-03-08" }
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
                        Address = "Cairo, Egypt",
                        PhoneNumber = p.Phone,
                        FullName = p.First + " " + p.Last,
                        ExternalPatientId = Guid.NewGuid().ToString(),
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    });
                }
            }

            await db.SaveChangesAsync();
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