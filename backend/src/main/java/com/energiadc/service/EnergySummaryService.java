package com.energiadc.service;

import com.energiadc.controller.ApiExceptionHandler.ApiProblem;
import com.energiadc.dto.EnergySummaryResponse;
import com.energiadc.model.DataCenter;
import com.energiadc.repository.DataCenterRepository;
import com.energiadc.repository.EnergyReadingRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;

@Service
public class EnergySummaryService {
    private final DataCenterRepository datacenters;
    private final EnergyReadingRepository readings;
    public EnergySummaryService(DataCenterRepository datacenters, EnergyReadingRepository readings) {
        this.datacenters = datacenters; this.readings = readings;
    }

    @Transactional(readOnly = true)
    public EnergySummaryResponse summarize(Integer id, OffsetDateTime start, OffsetDateTime end) {
        if (start == null || end == null || !start.isBefore(end))
            throw new ApiProblem(HttpStatus.UNPROCESSABLE_ENTITY, "start deve ser anterior a end.");
        DataCenter dc = datacenters.findById(id)
                .orElseThrow(() -> new ApiProblem(HttpStatus.NOT_FOUND, "Datacenter não encontrado."));
        List<Object[]> rows = readings.summarize(id, start.toInstant(), end.toInstant());
        Object[] row = rows.getFirst();
        BigDecimal total = decimal(row[0]);
        BigDecimal it = decimal(row[1]);
        long count = ((Number) row[2]).longValue();
        if (count == 0) throw new ApiProblem(HttpStatus.NOT_FOUND, "Nenhuma medição encontrada no período informado.");
        BigDecimal pue = total.divide(it, 12, RoundingMode.HALF_UP);
        BigDecimal tariff = dc.getElectricityTariff();
        BigDecimal limit = dc.getPueLimit();
        EnergySummaryResponse.AlertInfo alert = pue.compareTo(limit) > 0
                ? new EnergySummaryResponse.AlertInfo("PUE_ABOVE_LIMIT", "warning",
                    "PUE calculado (" + pue.setScale(2, RoundingMode.HALF_UP).toPlainString() +
                    ") acima do limite configurado (" + limit.setScale(2, RoundingMode.HALF_UP).toPlainString() + ").")
                : null;
        return new EnergySummaryResponse(
                new EnergySummaryResponse.DatacenterInfo(dc.getId(), dc.getName(), dc.getLocation()),
                new EnergySummaryResponse.Period(start.withOffsetSameInstant(ZoneOffset.UTC), end.withOffsetSameInstant(ZoneOffset.UTC)),
                count, total.setScale(3, RoundingMode.HALF_UP), it.setScale(3, RoundingMode.HALF_UP),
                pue.setScale(3, RoundingMode.HALF_UP), limit, total.multiply(tariff).setScale(2, RoundingMode.HALF_UP), alert);
    }
    private BigDecimal decimal(Object value) { return value instanceof BigDecimal b ? b : new BigDecimal(value.toString()); }
}
