using CLINICSYSTEM.Models;

namespace CLINICSYSTEM.Repositories;

/// <summary>
/// Unit of Work interface for managing database transactions
/// </summary>
public interface IUnitOfWork : IDisposable
{
    // Repositories
    IRepository<UserModel> Users { get; }
    IRepository<PatientModel> Patients { get; }
    IRepository<DoctorModel> Doctors { get; }
    IRepository<AppointmentModel> Appointments { get; }
    IRepository<TimeSlotModel> TimeSlots { get; }
    IRepository<DoctorSchedule> DoctorSchedules { get; }
    IRepository<ConsultationModel> Consultations { get; }
    IRepository<PrescriptionModel> Prescriptions { get; }
    IRepository<MedicalRecordModel> MedicalRecords { get; }
    IRepository<MedicalImageModel> MedicalImages { get; }
    IRepository<NotificationModel> Notifications { get; }

    // Generic repository access
    IRepository<TEntity> Repository<TEntity>() where TEntity : class;

    // Transaction management
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    Task BeginTransactionAsync(CancellationToken cancellationToken = default);
    Task CommitTransactionAsync(CancellationToken cancellationToken = default);
    Task RollbackTransactionAsync(CancellationToken cancellationToken = default);
}
