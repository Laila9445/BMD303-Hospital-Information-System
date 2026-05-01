using System.Security.Claims;

namespace CLINICSYSTEM.Extensions;

/// <summary>
/// Extension methods for ClaimsPrincipal
/// </summary>
public static class ClaimsPrincipalExtensions
{
    /// <summary>
    /// Get user ID from claims
    /// </summary>
    public static int GetUserId(this ClaimsPrincipal principal)
    {
        var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(userIdClaim, out var userId) ? userId : 0;
    }

    /// <summary>
    /// Get user email from claims
    /// </summary>
    public static string? GetUserEmail(this ClaimsPrincipal principal)
    {
        return principal.FindFirst(ClaimTypes.Email)?.Value;
    }

    /// <summary>
    /// Get user name from claims
    /// </summary>
    public static string? GetUserName(this ClaimsPrincipal principal)
    {
        return principal.FindFirst(ClaimTypes.Name)?.Value;
    }

    /// <summary>
    /// Get user role from claims
    /// </summary>
    public static string? GetUserRole(this ClaimsPrincipal principal)
    {
        return principal.FindFirst(ClaimTypes.Role)?.Value;
    }

    /// <summary>
    /// Check if user is in role
    /// </summary>
    public static bool IsInRole(this ClaimsPrincipal principal, string role)
    {
        return principal.IsInRole(role);
    }

    /// <summary>
    /// Check if user is doctor
    /// </summary>
    public static bool IsDoctor(this ClaimsPrincipal principal)
    {
        return principal.IsInRole("Doctor");
    }

    /// <summary>
    /// Check if user is patient
    /// </summary>
    public static bool IsPatient(this ClaimsPrincipal principal)
    {
        return principal.IsInRole("Patient");
    }

    /// <summary>
    /// Get all user claims as dictionary
    /// </summary>
    public static Dictionary<string, string> GetAllClaims(this ClaimsPrincipal principal)
    {
        return principal.Claims.ToDictionary(c => c.Type, c => c.Value);
    }

    /// <summary>
    /// Check if user has specific claim
    /// </summary>
    public static bool HasClaim(this ClaimsPrincipal principal, string claimType, string claimValue)
    {
        return principal.HasClaim(claimType, claimValue);
    }
}
