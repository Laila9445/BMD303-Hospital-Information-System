using CLINICSYSTEM.Data;
using CLINICSYSTEM.Models;
using Microsoft.EntityFrameworkCore.Storage;

namespace CLINICSYSTEM.Repositories;

/// <summary>
/// Unit of Work implementation for managing database transactions
/// </summary>
public class UnitOfWork : IUnitOfWork
{
    private readonly ClinicDbContext _context;
    private IDbContextTransaction? _transaction;
    private bool _disposed;

    // Repository instances
    private IRepository<UserModel>? _users;
    private IRepository<PatientModel>? _patients;
    private IRepository<DoctorModel>? _doctors;
    private IRepository<AppointmentModel>? _appointments;
    private IRepository<TimeSlotModel>? _timeSlots;
    private IRepository<DoctorSchedule>? _doctorSchedules;
    private IRepository<ConsultationModel>? _consultations;
    private IRepository<PrescriptionModel>? _prescriptions;
    private IRepository<MedicalRecordModel>? _medicalRecords;
    private IRepository<MedicalImageModel>? _medicalImages;
    private IRepository<NotificationModel>? _notifications;

    // Dictionary for generic repositories
    private readonly Dictionary<Type, object> _repositories = new();

    public UnitOfWork(ClinicDbContext context)
    {
        _context = context;
    }

    #region Repository Properties

    public IRepository<UserModel> Users => _users ??= new Repository<UserModel>(_context);
    public IRepository<PatientModel> Patients => _patients ??= new Repository<PatientModel>(_context);
    public IRepository<DoctorModel> Doctors => _doctors ??= new Repository<DoctorModel>(_context);
    public IRepository<AppointmentModel> Appointments => _appointments ??= new Repository<AppointmentModel>(_context);
    public IRepository<TimeSlotModel> TimeSlots => _timeSlots ??= new Repository<TimeSlotModel>(_context);
    public IRepository<DoctorSchedule> DoctorSchedules => _doctorSchedules ??= new Repository<DoctorSchedule>(_context);
    public IRepository<ConsultationModel> Consultations => _consultations ??= new Repository<ConsultationModel>(_context);
    public IRepository<PrescriptionModel> Prescriptions => _prescriptions ??= new Repository<PrescriptionModel>(_context);
    public IRepository<MedicalRecordModel> MedicalRecords => _medicalRecords ??= new Repository<MedicalRecordModel>(_context);
    public IRepository<MedicalImageModel> MedicalImages => _medicalImages ??= new Repository<MedicalImageModel>(_context);
    public IRepository<NotificationModel> Notifications => _notifications ??= new Repository<NotificationModel>(_context);

    #endregion

    #region Generic Repository Access

    public IRepository<TEntity> Repository<TEntity>() where TEntity : class
    {
        var type = typeof(TEntity);

        if (!_repositories.ContainsKey(type))
        {
            _repositories[type] = new Repository<TEntity>(_context);
        }

        return (IRepository<TEntity>)_repositories[type];
    }

    #endregion

    #region Transaction Management

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task BeginTransactionAsync(CancellationToken cancellationToken = default)
    {
        _transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
    }

    public async Task CommitTransactionAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            await _context.SaveChangesAsync(cancellationToken);
            if (_transaction != null)
            {
                await _transaction.CommitAsync(cancellationToken);
            }
        }
        catch
        {
            await RollbackTransactionAsync(cancellationToken);
            throw;
        }
        finally
        {
            if (_transaction != null)
            {
                await _transaction.DisposeAsync();
                _transaction = null;
            }
        }
    }

    public async Task RollbackTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction != null)
        {
            await _transaction.RollbackAsync(cancellationToken);
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    #endregion

    #region Dispose

    protected virtual void Dispose(bool disposing)
    {
        if (!_disposed && disposing)
        {
            _transaction?.Dispose();
            _context.Dispose();
        }
        _disposed = true;
    }

    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }

    #endregion
}
