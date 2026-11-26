package com.energiadc.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

/** DTOs das rotas de monitoramento (leituras, alertas e registro de medições). */
public final class MonitoringDtos {
    private MonitoringDtos() {}

    public record ReadingResponse(
        Integer id,
        @JsonProperty("measured_at") OffsetDateTime measuredAt,
        @JsonProperty("energy_total_kwh") BigDecimal energyTotalKwh,
        @JsonProperty("energy_it_kwh") BigDecimal energyItKwh,
        BigDecimal pue,
        @JsonProperty("estimated_cost_brl") BigDecimal estimatedCostBrl,
        @JsonProperty("above_limit") boolean aboveLimit
    ) {}

    public record AlertResponse(
        Integer id,
        String type,
        String severity,
        String message,
        @JsonProperty("created_at") OffsetDateTime createdAt,
        @JsonProperty("reading_id") Integer readingId,
        @JsonProperty("reading_measured_at") OffsetDateTime readingMeasuredAt
    ) {}

    public record NewReadingRequest(
        @JsonProperty("measured_at") OffsetDateTime measuredAt,
        @JsonProperty("energy_total_kwh") BigDecimal energyTotalKwh,
        @JsonProperty("energy_it_kwh") BigDecimal energyItKwh
    ) {}

    public record NewReadingResponse(ReadingResponse reading, AlertResponse alert) {}

    public record SimulationResponse(int created, int skipped, @JsonProperty("alerts_created") int alertsCreated) {}
}
