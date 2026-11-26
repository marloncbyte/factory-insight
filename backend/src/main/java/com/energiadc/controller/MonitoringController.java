package com.energiadc.controller;

import com.energiadc.dto.MonitoringDtos.*;
import com.energiadc.service.MonitoringService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/datacenters/{datacenterId}")
public class MonitoringController {
    private final MonitoringService service;
    public MonitoringController(MonitoringService service) { this.service = service; }

    @GetMapping("/readings")
    public List<ReadingResponse> readings(
            @PathVariable Integer datacenterId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime end) {
        return service.listReadings(datacenterId, start, end);
    }

    @PostMapping("/readings")
    @ResponseStatus(HttpStatus.CREATED)
    public NewReadingResponse register(@PathVariable Integer datacenterId, @RequestBody NewReadingRequest request) {
        return service.register(datacenterId, request);
    }

    @PostMapping("/readings/simulate")
    @ResponseStatus(HttpStatus.CREATED)
    public SimulationResponse simulate(@PathVariable Integer datacenterId, @RequestParam(defaultValue = "24") int hours) {
        return service.simulate(datacenterId, hours);
    }

    @GetMapping("/alerts")
    public List<AlertResponse> alerts(@PathVariable Integer datacenterId) {
        return service.listAlerts(datacenterId);
    }
}
