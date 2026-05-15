using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using CLINICSYSTEM.Models;

namespace CLINICSYSTEM.Data
{
    public class ClinicDbContext : IdentityDbContext<UserModel, IdentityRole<int>, int>
    {
        public ClinicDbContext(DbContextOptions<ClinicDbContext> options) : base(options)
        {
        }

        // public new DbSet<UserModel> Users { get; set; }
        
        /// <summary>
        /// Minimal patient reference table - full data in Patient Portal service
        /// </summary>
        public DbSet<PatientModel> Patients { get; set; }
        
        public DbSet<DoctorModel> Doctors { get; set; }
        public DbSet<NurseModel> Nurses { get; set; }
        public DbSet<PatientCareTaskModel> PatientCareTasks { get; set; }
        public DbSet<AppointmentModel> Appointments { get; set; }
        public DbSet<TimeSlotModel> TimeSlots { get; set; }
        public DbSet<DoctorSchedule> DoctorSchedules { get; set; }
        public DbSet<ConsultationModel> Consultations { get; set; }
        public DbSet<PrescriptionModel> Prescriptions { get; set; }
        public DbSet<MedicalRecordModel> MedicalRecords { get; set; }
        public DbSet<MedicalImageModel> MedicalImages { get; set; }
        public DbSet<NotificationModel> Notifications { get; set; }
        public DbSet<ReferralModel> Referrals { get; set; }
        public DbSet<MedicalImagingModel> MedicalImagings { get; set; }
        public DbSet<TherapySessionModel> TherapySessions { get; set; }
        public DbSet<TherapyPlanModel> TherapyPlans { get; set; }
        public DbSet<BillingService> BillingServices { get; set; }
        public DbSet<BillingInvoice> BillingInvoices { get; set; }
        public DbSet<BillingPayment> BillingPayments { get; set; }
        public DbSet<PhysioTreatmentPlan> PhysioTreatmentPlans { get; set; }
        public DbSet<RadiologyStudy> RadiologyStudies { get; set; }
        public DbSet<RadiologyReport> RadiologyReports { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<UserModel>().ToTable("AspNetUsers");

            modelBuilder.Entity<BillingInvoice>()
                .HasMany(i => i.Payments)
                .WithOne(p => p.BillingInvoice)
                .HasForeignKey(p => p.InvoiceId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<PhysioTreatmentPlan>()
                .HasOne(p => p.Patient)
                .WithMany()
                .HasForeignKey(p => p.PatientId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<PhysioTreatmentPlan>()
                .HasOne(p => p.Physio)
                .WithMany()
                .HasForeignKey(p => p.PhysioId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<RadiologyStudy>()
                .HasOne(s => s.Patient)
                .WithMany()
                .HasForeignKey(s => s.PatientId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<RadiologyStudy>()
                .HasOne(s => s.Radiologist)
                .WithMany()
                .HasForeignKey(s => s.RadiologistId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<RadiologyReport>()
                .HasOne(r => r.Study)
                .WithMany()
                .HasForeignKey(r => r.StudyId)
                .OnDelete(DeleteBehavior.Cascade);

            // REMOVED: Redundant HasKey() calls - EF Core auto-recognizes {EntityName}Id as primary keys
            // This significantly speeds up model building at startup
            // User relationships - Doctor and Nurse profiles
            modelBuilder.Entity<DoctorModel>()
                .HasOne(d => d.User)
                .WithOne(u => u.DoctorProfile)
                .HasForeignKey<DoctorModel>(d => d.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<NurseModel>()
                .HasOne(n => n.User)
                .WithOne(u => u.NurseProfile)
                .HasForeignKey<NurseModel>(n => n.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Nurse - PatientCareTask relationships
            modelBuilder.Entity<PatientCareTaskModel>()
                .HasOne(t => t.Nurse)
                .WithMany(n => n.CareTasks)
                .HasForeignKey(t => t.NurseId)
                .OnDelete(DeleteBehavior.Restrict);

            // Patient relationships (minimal - for backward compatibility)
            modelBuilder.Entity<AppointmentModel>()
                .HasOne(a => a.Patient)
                .WithMany(p => p.Appointments)
                .HasForeignKey(a => a.PatientId)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired(false); // Optional - use PatientExternalId instead

            modelBuilder.Entity<MedicalRecordModel>()
                .HasOne(mr => mr.Patient)
                .WithMany(p => p.MedicalRecords)
                .HasForeignKey(mr => mr.PatientId)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired(false);

            modelBuilder.Entity<MedicalImageModel>()
                .HasOne(mi => mi.Patient)
                .WithMany(p => p.MedicalImages)
                .HasForeignKey(mi => mi.PatientId)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired(false);

            // Doctor relationships
            modelBuilder.Entity<AppointmentModel>()
                .HasOne(a => a.Doctor)
                .WithMany(d => d.Appointments)
                .HasForeignKey(a => a.DoctorId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<DoctorSchedule>()
                .HasOne(ds => ds.Doctor)
                .WithMany(d => d.Schedules)
                .HasForeignKey(ds => ds.DoctorId)
                .OnDelete(DeleteBehavior.Cascade);

            // Referral relationships
            modelBuilder.Entity<ReferralModel>()
                .HasOne(r => r.Doctor)
                .WithMany()
                .HasForeignKey(r => r.DoctorId)
                .OnDelete(DeleteBehavior.Restrict);

            // Consultation relationships
            modelBuilder.Entity<ConsultationModel>()
                .HasOne(c => c.Appointment)
                .WithOne(a => a.Consultation)
                .HasForeignKey<ConsultationModel>(c => c.AppointmentId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PrescriptionModel>()
                .HasOne(p => p.Consultation)
                .WithMany(c => c.Prescriptions)
                .HasForeignKey(p => p.ConsultationId)
                .OnDelete(DeleteBehavior.Cascade);

            // TimeSlot relationships
            modelBuilder.Entity<TimeSlotModel>()
                .HasOne(ts => ts.Schedule)
                .WithMany(ds => ds.TimeSlots)
                .HasForeignKey(ts => ts.ScheduleId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<AppointmentModel>()
                .HasOne(a => a.TimeSlot)
                .WithMany(ts => ts.Appointments)
                .HasForeignKey(a => a.TimeSlotId)
                .OnDelete(DeleteBehavior.Restrict);

            // Consultation - MedicalRecord
            modelBuilder.Entity<MedicalRecordModel>()
                .HasOne(mr => mr.Consultation)
                .WithMany(c => c.MedicalRecords)
                .HasForeignKey(mr => mr.ConsultationId)
                .OnDelete(DeleteBehavior.SetNull);

            // Consultation - MedicalImage
            modelBuilder.Entity<MedicalImageModel>()
                .HasOne(mi => mi.Consultation)
                .WithMany()
                .HasForeignKey(mi => mi.ConsultationId)
                .OnDelete(DeleteBehavior.SetNull);

            // Indexes
            modelBuilder.Entity<UserModel>()
                .HasIndex(u => u.Email)
                .IsUnique();

            // Patient external ID index for cross-service lookups
            modelBuilder.Entity<PatientModel>()
                .HasIndex(p => p.ExternalPatientId)
                .IsUnique();

            modelBuilder.Entity<AppointmentModel>()
                .HasIndex(a => new { a.DoctorId, a.PatientId });
            
            // Index for external patient ID in appointments
            modelBuilder.Entity<AppointmentModel>()
                .HasIndex(a => a.PatientExternalId);

            modelBuilder.Entity<TimeSlotModel>()
                .HasIndex(ts => new { ts.ScheduleId, ts.SlotDate });

            modelBuilder.Entity<DoctorSchedule>()
                .HasIndex(ds => new { ds.DoctorId, ds.DayOfWeek });

            // Referral indexes for external services
            modelBuilder.Entity<ReferralModel>()
                .HasIndex(r => r.PatientExternalId);

            modelBuilder.Entity<ReferralModel>()
                .HasIndex(r => new { r.DoctorId, r.Status });

            modelBuilder.Entity<ReferralModel>()
                .HasIndex(r => r.FhirServiceRequestId);

            // Nurse and PatientCareTask indexes
            modelBuilder.Entity<NurseModel>()
                .HasIndex(n => n.UserId)
                .IsUnique();

            modelBuilder.Entity<PatientCareTaskModel>()
                .HasIndex(t => new { t.NurseId, t.Status });

            modelBuilder.Entity<PatientCareTaskModel>()
                .HasIndex(t => t.PatientExternalId);



            modelBuilder.Entity<PatientCareTaskModel>()
                .HasIndex(t => t.ScheduledAt);
        }
    }
}
