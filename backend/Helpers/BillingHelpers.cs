using CLINICSYSTEM.Data;
using Microsoft.EntityFrameworkCore;

namespace CLINICSYSTEM.Helpers
{
    public static class BillingHelpers
    {
        public static string NextServiceId(ClinicDbContext db)
        {
            var count = db.BillingServices.Count() + 1;
            return $"SVC-{count:D3}";
        }

        public static string NextInvoiceId(ClinicDbContext db)
        {
            var count = db.BillingInvoices.Count() + 1;
            return $"INV-{count:D4}";
        }

        public static string NextPaymentId(ClinicDbContext db)
        {
            var count = db.BillingPayments.Count() + 1;
            return $"PAY-{count:D3}";
        }
    }
}
