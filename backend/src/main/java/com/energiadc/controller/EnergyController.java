package com.energiadc.controller;

import com.energiadc.dto.EnergySummaryResponse;
import com.energiadc.service.EnergySummaryService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import java.time.OffsetDateTime;

@RestController
@RequestMapping("/api/datacenters")
public class EnergyController {
    private final EnergySummaryService service;
    public EnergyController(EnergySummaryService service) { this.service = service; }

    @GetMapping("/{datacenterId}/energy-summary")
    public EnergySummaryResponse energySummary(
            @PathVariable Integer datacenterId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime end) {
        return service.summarize(datacenterId, start, end);
    }
}
