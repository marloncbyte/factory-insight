package com.energiadc.service;

import com.energiadc.controller.ApiExceptionHandler.ApiProblem;
import com.energiadc.dto.MonitoringDtos.*;
import com.energiadc.model.Alert;
import com.energiadc.model.DataCenter;
import com.energiadc.model.EnergyReading;
import com.energiadc.repository.AlertRepository;
import com.energiadc.repository.DataCenterRepository;
import com.energiadc.repository.EnergyReadingRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

/** Consulta de leituras e alertas, registro de medições e simulador de sensores. */
@Service
public class MonitoringService {
    private final DataCenterRepository datacenters;
    private final EnergyReadingRepository readings;
    private final AlertRepository alerts;

    public MonitoringService(DataCenterRepository datacenters, EnergyReadingRepository readings, AlertRepository alerts) {
        this.datacenters = datacenters; this.readings = readings; this.alerts = alerts;
    }

    @Transactional(readOnly = true)
    public List<ReadingResponse> listReadings(Integer dcId, OffsetDateTime start, OffsetDateTime end) {
        if (start == null || end == null || !start.isBefore(end))
            throw new ApiProblem(HttpStatus.UNPROCESSABLE_ENTITY, "start deve ser anterior a end.");
        DataCenter dc = findDatacenter(dcId);
        return readings.findInPeriod(dcId, start.toInstant(), end.toInstant()).stream()
                .map(r -> toResponse(r, dc)).toList();
    }

    @Transactional(readOnly = true)
    public List<AlertResponse> listAlerts(Integer dcId) {
        findDatacenter(dcId);
        return alerts.findByDatacenter(dcId).stream().map(this::toResponse).toList();
    }

    @Transactional
    public NewReadingResponse register(Integer dcId, NewReadingRequest request) {
        DataCenter dc = findDatacenter(dcId);
        if (request == null || request.energyTotalKwh() == null || request.energyItKwh() == null)
            throw new ApiProblem(HttpStatus.UNPROCESSABLE_ENTITY, "Informe energy_total_kwh e energy_it_kwh.");
        BigDecimal total = request.energyTotalKwh().setScale(3, RoundingMode.HALF_UP);
        BigDecimal it = request.energyItKwh().setScale(3, RoundingMode.HALF_UP);
        if (total.signum() <= 0 || it.signum() <= 0)
            throw new ApiProblem(HttpStatus.UNPROCESSABLE_ENTITY, "Os consumos precisam ser positivos.");
        if (total.compareTo(it) < 0)
            throw new ApiProblem(HttpStatus.UNPROCESSABLE_ENTITY, "O consumo total deve ser maior ou igual ao consumo de TI.");
        Instant measuredAt = request.measuredAt() != null
                ? request.measuredAt().toInstant().truncatedTo(ChronoUnit.SECONDS)
                : Instant.now().truncatedTo(ChronoUnit.SECONDS);
        if (readings.existsByDatacenter_IdAndMeasuredAt(dcId, measuredAt))
            throw new ApiProblem(HttpStatus.CONFLICT, "Já existe uma medição deste datacenter nesse horário.");
        EnergyReading saved = readings.save(new EnergyReading(dc, measuredAt, total, it));
        Alert alert = checkAlert(saved, dc);
        return new NewReadingResponse(toResponse(saved, dc), alert == null ? null : toResponse(alert));
    }

    /** Gera leituras horárias simuladas (como se viessem de sensores) para as últimas N horas. */
    @Transactional
    public SimulationResponse simulate(Integer dcId, int hours) {
        if (hours < 1 || hours > 720)
            throw new ApiProblem(HttpStatus.UNPROCESSABLE_ENTITY, "hours deve estar entre 1 e 720.");
        DataCenter dc = findDatacenter(dcId);
        ThreadLocalRandom rnd = ThreadLocalRandom.current();
        Instant now = Instant.now().truncatedTo(ChronoUnit.HOURS);
        int created = 0, skipped = 0, alertCount = 0;
        for (int h = hours; h >= 1; h--) {
            Instant at = now.minus(h, ChronoUnit.HOURS);
            if (readings.existsByDatacenter_IdAndMeasuredAt(dcId, at)) { skipped++; continue; }
            int hourOfDay = at.atZone(ZoneOffset.ofHours(-3)).getHour();
            double load = 0.85 + 0.15 * Math.sin((hourOfDay - 8) / 24.0 * 2 * Math.PI);
            double itKwh = 80 * load + rnd.nextDouble(-3, 3);
            double pue = rnd.nextDouble() < 0.12 ? rnd.nextDouble(1.82, 2.15) : rnd.nextDouble(1.40, 1.75);
            BigDecimal it = BigDecimal.valueOf(itKwh).setScale(3, RoundingMode.HALF_UP);
            BigDecimal total = BigDecimal.valueOf(itKwh * pue).setScale(3, RoundingMode.HALF_UP);
            EnergyReading saved = readings.save(new EnergyReading(dc, at, total, it));
            created++;
            if (checkAlert(saved, dc) != null) alertCount++;
        }
        return new SimulationResponse(created, skipped, alertCount);
    }

    private Alert checkAlert(EnergyReading reading, DataCenter dc) {
        BigDecimal pue = pue(reading);
        if (pue.compareTo(dc.getPueLimit()) <= 0) return null;
        boolean critical = pue.compareTo(dc.getPueLimit().add(new BigDecimal("0.20"))) > 0;
        return alerts.save(new Alert(reading, "PUE_ABOVE_LIMIT", critical ? "critical" : "warning",
                "PUE da leitura (" + pue.setScale(2, RoundingMode.HALF_UP).toPlainString() +
                ") acima do limite configurado (" + dc.getPueLimit().setScale(2, RoundingMode.HALF_UP).toPlainString() + ")."));
    }

    private DataCenter findDatacenter(Integer id) {
        return datacenters.findById(id).orElseThrow(() -> new ApiProblem(HttpStatus.NOT_FOUND, "Datacenter não encontrado."));
    }

    private static BigDecimal pue(EnergyReading r) {
        return r.getEnergyTotalKwh().divide(r.getEnergyItKwh(), 12, RoundingMode.HALF_UP);
    }

    private ReadingResponse toResponse(EnergyReading r, DataCenter dc) {
        BigDecimal pue = pue(r);
        return new ReadingResponse(r.getId(), r.getMeasuredAt().atOffset(ZoneOffset.UTC),
                r.getEnergyTotalKwh(), r.getEnergyItKwh(), pue.setScale(3, RoundingMode.HALF_UP),
                r.getEnergyTotalKwh().multiply(dc.getElectricityTariff()).setScale(2, RoundingMode.HALF_UP),
                pue.compareTo(dc.getPueLimit()) > 0);
    }

    private AlertResponse toResponse(Alert a) {
        return new AlertResponse(a.getId(), a.getAlertType(), a.getSeverity(), a.getMessage(),
                a.getCreatedAt().atOffset(ZoneOffset.UTC), a.getReading().getId(),
                a.getReading().getMeasuredAt().atOffset(ZoneOffset.UTC));
    }
}
