namespace CLINICSYSTEM.Exceptions
{
    public static class DomainErrorCodes
    {
        public const string SlotUnavailable = "ERR_SLOT_UNAVAILABLE";
        public const string CannotCancelCompletedAppointment = "ERR_CANNOT_CANCEL_COMPLETED";
        public const string InvalidStatusTransition = "ERR_INVALID_STATUS_TRANSITION";
        public const string FileTooLargeOrType = "ERR_FILE_INVALID";
        public const string NotFound = "ERR_NOT_FOUND";
        public const string Unauthorized = "ERR_UNAUTHORIZED";
        public const string Validation = "ERR_VALIDATION";
    }
}