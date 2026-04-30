namespace Billing_Backend.Enums
{
    /// <summary>
    /// Invoice status enumeration
    /// </summary>
    public enum InvoiceStatus
    {
        Pending = 0,
        Partial = 1,
        Paid = 2,
        Cancelled = 3,
        Overdue = 4
    }

    /// <summary>
    /// Payment method enumeration
    /// </summary>
    public enum PaymentMethod
    {
        Cash = 0,
        Card = 1,
        BankTransfer = 2,
        MobileWallet = 3,
        Insurance = 4,
        Check = 5
    }

    /// <summary>
    /// Payment status enumeration
    /// </summary>
    public enum PaymentStatus
    {
        Pending = 0,
        Completed = 1,
        Failed = 2,
        Refunded = 3
    }
}
