package com.energiadc.service;

import com.energiadc.model.Alert;
import com.energiadc.model.DataCenter;
import com.energiadc.model.EnergyReading;
import com.energiadc.repository.AlertRepository;
import com.energiadc.repository.DataCenterRepository;
import com.energiadc.repository.EnergyReadingRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Component
public class DemoDataInitializer implements CommandLineRunner {
    private final DataCenterRepository datacenters;
    private final EnergyReadingRepository readings;
    private final AlertRepository alerts;
    public DemoDataInitializer(DataCenterRepository datacenters, EnergyReadingRepository readings, AlertRepository alerts) {
        this.datacenters = datacenters; this.readings = readings; this.alerts = alerts;
    }
    @Override @Transactional
    public void run(String... args) {
        if (datacenters.count() > 0) return;
        DataCenter dc = datacenters.save(new DataCenter("DC Sao Paulo", "São Paulo - SP", new BigDecimal("0.8200"), new BigDecimal("1.80")));
        Instant now = Instant.now().truncatedTo(ChronoUnit.HOURS);
        List<EnergyReading> demo = List.of(
            readings.save(new EnergyReading(dc, now.minus(2, ChronoUnit.HOURS), new BigDecimal("125.000"), new BigDecimal("80.000"))),
            readings.save(new EnergyReading(dc, now.minus(1, ChronoUnit.HOURS), new BigDecimal("132.000"), new BigDecimal("82.000"))),
            readings.save(new EnergyReading(dc, now, new BigDecimal("200.000"), new BigDecimal("85.000")))
        );
        alerts.save(new Alert(demo.getLast(), "PUE_ABOVE_LIMIT", "warning", "PUE da leitura (2.35) acima do limite configurado (1.80)."));
    }
}
