using System;

namespace CLINICSYSTEM.Exceptions
{
    /// <summary>
    /// Domain/business exception that carries an HTTP status and a machine-readable code.
    /// Services should throw this for business-rule failures (slot unavailable, invalid transition, etc.).
    /// </summary>
    public class BusinessException : Exception
    {
        public int StatusCode { get; }
        public string MachineCode { get; }

        public BusinessException(string machineCode, string message, int statusCode = 400)
            : base(message)
        {
            MachineCode = machineCode ?? "ERR_BUSINESS";
            StatusCode = statusCode;
        }

        public BusinessException(string machineCode, string message, Exception innerException, int statusCode = 400)
            : base(message, innerException)
        {
            MachineCode = machineCode ?? "ERR_BUSINESS";
            StatusCode = statusCode;
        }
    }
}