package com.energiadc.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record EnergySummaryResponse(
    DatacenterInfo datacenter,
    Period period,
    @JsonProperty("reading_count") long readingCount,
    @JsonProperty("energy_total_kwh") BigDecimal energyTotalKwh,
    @JsonProperty("energy_it_kwh") BigDecimal energyItKwh,
    BigDecimal pue,
    @JsonProperty("pue_limit") BigDecimal pueLimit,
    @JsonProperty("estimated_cost_brl") BigDecimal estimatedCostBrl,
    AlertInfo alert
) {
    public record DatacenterInfo(Integer id, String name, String location) {}
    public record Period(OffsetDateTime start, OffsetDateTime end) {}
    public record AlertInfo(String type, String severity, String message) {}
}
