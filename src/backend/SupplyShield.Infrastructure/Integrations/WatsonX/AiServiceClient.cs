using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace SupplyShield.Infrastructure.Integrations.WatsonX;

// ── DTO models that mirror the Python AI service contracts ──────────────────

internal sealed record ExplainRequest(
    [property: JsonPropertyName("context_type")] string ContextType,
    [property: JsonPropertyName("context_id")]   string ContextId,
    [property: JsonPropertyName("facts")]         Dictionary<string, object?> Facts);

internal sealed record ExplainResponse(
    [property: JsonPropertyName("status")]          string Status,
    [property: JsonPropertyName("context_type")]    string ContextType,
    [property: JsonPropertyName("context_id")]      string ContextId,
    [property: JsonPropertyName("explanation")]     string Explanation,
    [property: JsonPropertyName("watsonx_enabled")] bool WatsonxEnabled);

internal sealed record RiskScoreRequest(
    [property: JsonPropertyName("shipment_id")]             string ShipmentId,
    [property: JsonPropertyName("route_estimated_hours")]   double? RouteEstimatedHours,
    [property: JsonPropertyName("days_until_arrival")]      double? DaysUntilArrival,
    [property: JsonPropertyName("is_cold_chain")]           bool IsColdChain,
    [property: JsonPropertyName("priority")]                string Priority,
    [property: JsonPropertyName("active_disruption_count")] int ActiveDisruptionCount,
    [property: JsonPropertyName("max_disruption_severity")] string MaxDisruptionSeverity,
    [property: JsonPropertyName("carrier_on_time_rate")]    double CarrierOnTimeRate,
    [property: JsonPropertyName("historical_delay_rate")]   double HistoricalDelayRate,
    [property: JsonPropertyName("backend_risk_score")]      double? BackendRiskScore);

internal sealed record RiskScoreResponse(
    [property: JsonPropertyName("status")]                string Status,
    [property: JsonPropertyName("shipment_id")]           string ShipmentId,
    [property: JsonPropertyName("ml_risk_score")]         double MlRiskScore,
    [property: JsonPropertyName("risk_band")]             string RiskBand,
    [property: JsonPropertyName("feature_contributions")] Dictionary<string, double> FeatureContributions,
    [property: JsonPropertyName("explanation")]           string? Explanation);


/// <summary>
/// HTTP client wrapper for the Python AI service (FastAPI).
///
/// Architecture rules:
///   - This client sends ONLY verified structured facts to the AI service.
///   - Raw user input MUST NOT be forwarded.
///   - Every call wraps its return in try/catch so that AI failure never
///     crashes the main ASP.NET Core API — a safe fallback string is returned.
///   - IBM watsonx.ai credentials stay entirely inside the Python service.
/// </summary>
public sealed class AiServiceClient
{
    private readonly HttpClient _http;
    private readonly ILogger<AiServiceClient> _logger;

    private static readonly JsonSerializerOptions _json = new()
    {
        PropertyNameCaseInsensitive = true,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    };

    public AiServiceClient(HttpClient http, IConfiguration configuration, ILogger<AiServiceClient> logger)
    {
        _http = http;
        _logger = logger;
    }

    public bool IsConfigured => _http.BaseAddress is not null;

    // ── /predict/explain ────────────────────────────────────────────────────

    /// <summary>
    /// Sends a verified-facts payload to the Python AI service and returns the
    /// watsonx.ai generated explanation. Falls back to a safe string on any error.
    /// </summary>
    public async Task<string> GenerateExplanationAsync(
        string contextType,
        string contextId,
        Dictionary<string, object?> structuredFacts,
        CancellationToken ct = default)
    {
        if (!IsConfigured)
        {
            _logger.LogWarning("AI service not configured — returning placeholder.");
            return "AI explanation not available. Set AiService:BaseUrl.";
        }

        try
        {
            var payload = new ExplainRequest(contextType, contextId, structuredFacts);
            var response = await _http.PostAsJsonAsync("/predict/explain", payload, _json, ct);

            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync(ct);
                _logger.LogWarning(
                    "AI service /predict/explain returned {Status}: {Body}",
                    (int)response.StatusCode, body);
                return $"AI explanation unavailable (HTTP {(int)response.StatusCode}).";
            }

            var result = await response.Content.ReadFromJsonAsync<ExplainResponse>(_json, ct);
            return result?.Explanation ?? "No explanation returned.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "AI service /predict/explain call failed.");
            return $"AI explanation temporarily unavailable. ({ex.GetType().Name})";
        }
    }

    // ── /predict/risk-score ─────────────────────────────────────────────────

    /// <summary>
    /// Requests an ML risk score for a shipment. Falls back to (backendScore, "N/A") on error.
    /// </summary>
    public async Task<(double MlScore, string RiskBand, string? Explanation)> GetRiskScoreAsync(
        string shipmentId,
        double? daysUntilArrival,
        bool isColdChain,
        string priority,
        int activeDisruptionCount,
        string maxDisruptionSeverity,
        double backendRiskScore,
        CancellationToken ct = default)
    {
        if (!IsConfigured)
        {
            _logger.LogWarning("AI service not configured — returning backend score.");
            return (backendRiskScore, DeriveRiskBand(backendRiskScore), null);
        }

        try
        {
            var payload = new RiskScoreRequest(
                ShipmentId: shipmentId,
                RouteEstimatedHours: null,
                DaysUntilArrival: daysUntilArrival,
                IsColdChain: isColdChain,
                Priority: priority,
                ActiveDisruptionCount: activeDisruptionCount,
                MaxDisruptionSeverity: maxDisruptionSeverity,
                CarrierOnTimeRate: 1.0,
                HistoricalDelayRate: 0.0,
                BackendRiskScore: backendRiskScore);

            var response = await _http.PostAsJsonAsync("/predict/risk-score", payload, _json, ct);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning(
                    "AI service /predict/risk-score returned {Status}",
                    (int)response.StatusCode);
                return (backendRiskScore, DeriveRiskBand(backendRiskScore), null);
            }

            var result = await response.Content.ReadFromJsonAsync<RiskScoreResponse>(_json, ct);
            if (result is null)
                return (backendRiskScore, DeriveRiskBand(backendRiskScore), null);

            return (result.MlRiskScore, result.RiskBand, result.Explanation);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "AI service /predict/risk-score call failed.");
            return (backendRiskScore, DeriveRiskBand(backendRiskScore), null);
        }
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    private static string DeriveRiskBand(double score) => score switch
    {
        >= 0.75 => "CRITICAL",
        >= 0.50 => "HIGH",
        >= 0.25 => "MEDIUM",
        _ => "LOW",
    };
}
