using CLINICSYSTEM.Data;
using CLINICSYSTEM.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace CLINICSYSTEM.Data
{
    public static class DataSeeder
    {
        public static async Task SeedAsync(IApplicationBuilder app)
        {
            using (var scope = app.ApplicationServices.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<ClinicDbContext>();
                var userManager = scope.ServiceProvider.GetRequiredService<UserManager<UserModel>>();
                var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<int>>>();

                await context.Database.MigrateAsync();

                // Seed Roles
                string[] roleNames = { "Doctor", "Nurse", "Patient", "Physiotherapist", "Radiologist", "Admin" };
                foreach (var roleName in roleNames)
                {
                    var roleExist = await roleManager.RoleExistsAsync(roleName);
                    if (!roleExist)
                    {
                        await roleManager.CreateAsync(new IdentityRole<int>(roleName));
                    }
                }

                // Seed Users
                if (!userManager.Users.Any())
                {
                    var users = new List<(UserModel user, string password, string role)>
                    {
                        (new UserModel { UserName = "doctor@clinic.com", Email = "doctor@clinic.com", FirstName = "Ahmed", LastName = "Nabil", EmailConfirmed = true }, "Doctor@123!", "Doctor"),
                        (new UserModel { UserName = "nurse@clinic.com", Email = "nurse@clinic.com", FirstName = "Sara", LastName = "Mohamed", EmailConfirmed = true }, "Doctor@123!", "Nurse"),
                        (new UserModel { UserName = "patient@clinic.com", Email = "patient@clinic.com", FirstName = "Mohamed", LastName = "Ali", EmailConfirmed = true }, "Doctor@123!", "Patient"),
                        (new UserModel { UserName = "physio@clinic.com", Email = "physio@clinic.com", FirstName = "Layla", LastName = "Hassan", EmailConfirmed = true }, "Doctor@123!", "Physiotherapist"),
                        (new UserModel { UserName = "radiology@clinic.com", Email = "radiology@clinic.com", FirstName = "Omar", LastName = "Karim", EmailConfirmed = true }, "Doctor@123!", "Radiologist")
                    };

                    foreach (var (user, password, role) in users)
                    {
                        var result = await userManager.CreateAsync(user, password);
                        if (result.Succeeded)
                        {
                            await userManager.AddToRoleAsync(user, role);
                        }
                    }
                }

                // Seed Billing Services
                if (!context.BillingServices.Any())
                {
                    var services = new List<BillingService>
                    {
                        new BillingService { Id = "SVC-001", ServiceName = "General Consultation", Department = "Doctor", Price = 250.00m, Status = "Active", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                        new BillingService { Id = "SVC-002", ServiceName = "X-Ray", Department = "Radiology", Price = 150.00m, Status = "Active", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                        new BillingService { Id = "SVC-003", ServiceName = "CT Scan", Department = "Radiology", Price = 500.00m, Status = "Active", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                        new BillingService { Id = "SVC-004", ServiceName = "MRI", Department = "Radiology", Price = 800.00m, Status = "Active", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                        new BillingService { Id = "SVC-005", ServiceName = "Physiotherapy Session", Department = "Physiotherapy", Price = 200.00m, Status = "Active", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                        new BillingService { Id = "SVC-006", ServiceName = "Physiotherapy Assessment", Department = "Physiotherapy", Price = 300.00m, Status = "Active", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
                    };
                    await context.BillingServices.AddRangeAsync(services);
                    await context.SaveChangesAsync();
                }
            }
        }
    }
}
