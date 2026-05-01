using CLINICSYSTEM.Extensions;
using System.Security.Claims;

namespace CLINICSYSTEM.Services;

/// <summary>
/// Service for getting current authenticated user information
/// </summary>
public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    private ClaimsPrincipal? User => _httpContextAccessor.HttpContext?.User;

    public int UserId => User?.GetUserId() ?? 0;

    public string? Email => User?.GetUserEmail();

    public string? UserName => User?.GetUserName();

    public string? Role => User?.GetUserRole();

    public bool IsAuthenticated => User?.Identity?.IsAuthenticated ?? false;

    public bool IsDoctor => User?.IsDoctor() ?? false;

    public bool IsPatient => User?.IsPatient() ?? false;

    public IEnumerable<Claim> Claims => User?.Claims ?? Enumerable.Empty<Claim>();
}
