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

    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(_configuration["Supabase:Url"]) &&
        !string.IsNullOrWhiteSpace(_configuration["Supabase:ServiceRoleKey"]);

    /// <summary>
    /// Phase 3+: Return initialised Supabase client.
    /// Raises InvalidOperationException if not configured.
    /// </summary>
    public object GetClient()
    {
        if (!IsConfigured)
            throw new InvalidOperationException(
                "Supabase is not configured. Set Supabase:Url and Supabase:ServiceRoleKey. (Phase 3+)");

        // Phase 3+:
        // var client = new Supabase.Client(url, serviceRoleKey);
        // await client.InitializeAsync();
        // return client;
        throw new NotImplementedException("Supabase client initialisation — Phase 3+");
    }
}
