using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace SupplyShield.Infrastructure.Integrations.Supabase;

/// <summary>
/// Wrapper around the Supabase client.
///
/// Phase 2: Stub — does not connect to Supabase. Application starts without credentials.
/// Phase 3+: Initialise real Supabase connection using SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
///
/// Architecture rule: Only Infrastructure uses this wrapper.
/// Service-role key MUST NOT be exposed to the frontend or returned in any API response.
/// </summary>
public sealed class SupabaseClientWrapper
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<SupabaseClientWrapper> _logger;

    public SupabaseClientWrapper(IConfiguration configuration, ILogger<SupabaseClientWrapper> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public string? SupabaseUrl =>
        _configuration["Supabase:Url"] ??
        Environment.GetEnvironmentVariable("SUPABASE_URL");

    private string? ServiceRoleKey =>
        _configuration["Supabase:ServiceRoleKey"] ??
        Environment.GetEnvironmentVariable("SUPABASE_SERVICE_ROLE_KEY");

    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(SupabaseUrl) &&
        !string.IsNullOrWhiteSpace(ServiceRoleKey);

    /// <summary>
    /// Safe metadata summary for diagnostics (never returns secret keys).
    /// </summary>
    public SupabaseStatus GetStatus()
    {
        return new SupabaseStatus(
            IsConfigured: IsConfigured,
            Url: SupabaseUrl ?? "Not Configured",
            HasServiceRoleKey: !string.IsNullOrWhiteSpace(ServiceRoleKey)
        );
    }
}

public record SupabaseStatus(bool IsConfigured, string Url, bool HasServiceRoleKey);

