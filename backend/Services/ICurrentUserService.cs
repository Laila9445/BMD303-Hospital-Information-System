using System.Security.Claims;

namespace CLINICSYSTEM.Services;

/// <summary>
/// Interface for getting current authenticated user information
/// </summary>
public interface ICurrentUserService
{
    /// <summary>
    /// Get current user ID
    /// </summary>
    int UserId { get; }

    /// <summary>
    /// Get current user email
    /// </summary>
    string? Email { get; }

    /// <summary>
    /// Get current user name
    /// </summary>
    string? UserName { get; }

    /// <summary>
    /// Get current user role
    /// </summary>
    string? Role { get; }

    /// <summary>
    /// Check if user is authenticated
    /// </summary>
    bool IsAuthenticated { get; }

    /// <summary>
    /// Check if user is doctor
    /// </summary>
    bool IsDoctor { get; }

    /// <summary>
    /// Check if user is patient
    /// </summary>
    bool IsPatient { get; }

    /// <summary>
    /// Get all user claims
    /// </summary>
    IEnumerable<Claim> Claims { get; }
}
