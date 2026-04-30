using Billing_Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Billing_Backend.Data
{
    /// <summary>
    /// Billing system database context
    /// </summary>
    public class BillingDbContext : DbContext
    {
        public BillingDbContext(DbContextOptions<BillingDbContext> options) : base(options)
        {
        }

        public DbSet<InvoiceModel> Invoices { get; set; }
        public DbSet<InvoiceItemModel> InvoiceItems { get; set; }
        public DbSet<PaymentModel> Payments { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure primary keys explicitly
            modelBuilder.Entity<InvoiceModel>()
                .HasKey(i => i.InvoiceId);

            modelBuilder.Entity<InvoiceItemModel>()
                .HasKey(ii => ii.InvoiceItemId);

            modelBuilder.Entity<PaymentModel>()
                .HasKey(p => p.PaymentId);

            // ===== Relationships =====

            // Invoice -> InvoiceItems (One-to-Many)
            modelBuilder.Entity<InvoiceModel>()
                .HasMany(i => i.Items)
                .WithOne(ii => ii.Invoice)
                .HasForeignKey(ii => ii.InvoiceId)
                .OnDelete(DeleteBehavior.Cascade);

            // Invoice -> Payments (One-to-Many)
            modelBuilder.Entity<InvoiceModel>()
                .HasMany(i => i.Payments)
                .WithOne(p => p.Invoice)
                .HasForeignKey(p => p.InvoiceId)
                .OnDelete(DeleteBehavior.Cascade);

            // ===== Indexes =====

            // Invoice indexes
            modelBuilder.Entity<InvoiceModel>()
                .HasIndex(i => i.PatientId);

            modelBuilder.Entity<InvoiceModel>()
                .HasIndex(i => i.PatientExternalId);

            modelBuilder.Entity<InvoiceModel>()
                .HasIndex(i => i.IdempotencyKey)
                .IsUnique();

            modelBuilder.Entity<InvoiceModel>()
                .HasIndex(i => new { i.PatientId, i.Status });

            modelBuilder.Entity<InvoiceModel>()
                .HasIndex(i => i.CreatedAt);

            // Payment indexes
            modelBuilder.Entity<PaymentModel>()
                .HasIndex(p => p.TransactionId)
                .IsUnique();

            modelBuilder.Entity<PaymentModel>()
                .HasIndex(p => p.InvoiceId);

            modelBuilder.Entity<PaymentModel>()
                .HasIndex(p => p.CreatedAt);

            // InvoiceItem indexes
            modelBuilder.Entity<InvoiceItemModel>()
                .HasIndex(ii => ii.InvoiceId);
        }
    }
}
