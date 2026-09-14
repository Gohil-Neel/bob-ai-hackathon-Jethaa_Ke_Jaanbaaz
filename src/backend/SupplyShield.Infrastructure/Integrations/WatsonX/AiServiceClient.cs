using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace SupplyShield.Infrastructure.Integrations.WatsonX;

/// <summary>
/// HTTP client wrapper for the Python AI service (FastAPI).
/// The ASP.NET Core backend calls the Python service via HTTP — it does NOT
/// call watsonx.ai directly. IBM credentials stay inside the Python service.
///
/// Phase 2: Stub — returns placeholder string. Application starts without AI service running.
/// Phase 13+: Make real HTTP calls to http://localhost:8001 (or configured AI service URL).
///
/// Architecture rule:
///   - This wrapper sends only VERIFIED structured facts to the AI service.
///   - Raw user input MUST NOT be forwarded to the AI service.
///   - AI failure must be caught and handled gracefully — never crash the main API.
/// </summary>
public sealed class AiServiceClient
{
    private readonly HttpClient _http;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AiServiceClient> _logger;

    public AiServiceClient(HttpClient http, IConfiguration configuration, ILogger<AiServiceClient> logger)
    {
        _http = http;
        _configuration = configuration;
        _logger = logger;
    }

    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(_configuration["AiService:BaseUrl"]);

    /// <summary>
    /// Sends a structured fact payload to the AI service and returns the explanation string.
    /// Phase 13+: Real HTTP call.
    /// </summary>
    public async Task<string> GenerateExplanationAsync(
        string contextType,
        object structuredFacts,
        CancellationToken ct = default)
    {
        if (!IsConfigured)
        {
            _logger.LogWarning("AI service not configured — returning placeholder. Set AiService:BaseUrl.");
            return "AI explanation not available. AI service is not configured. (Phase 13+)";
        }

        // Phase 13+:
        // var response = await _http.PostAsJsonAsync("/explain", new { contextType, facts = structuredFacts }, ct);
        // response.EnsureSuccessStatusCode();
        // return await response.Content.ReadAsStringAsync(ct);

        await Task.CompletedTask;
        throw new NotImplementedException("AiServiceClient.GenerateExplanationAsync — Phase 13+");
    }
}
