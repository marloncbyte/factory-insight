package com.energiadc.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "energy_readings", uniqueConstraints = @UniqueConstraint(name = "uq_reading_datacenter_timestamp", columnNames = {"datacenter_id", "measured_at"}))
public class EnergyReading {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "datacenter_id", nullable = false, foreignKey = @ForeignKey(name = "fk_energy_reading_datacenter"))
    private DataCenter datacenter;
    @Column(name = "measured_at", nullable = false)
    private Instant measuredAt;
    @Column(name = "energy_total_kwh", nullable = false, precision = 12, scale = 3)
    private BigDecimal energyTotalKwh;
    @Column(name = "energy_it_kwh", nullable = false, precision = 12, scale = 3)
    private BigDecimal energyItKwh;
    @OneToMany(mappedBy = "reading")
    private List<Alert> alerts = new ArrayList<>();

    protected EnergyReading() {}
    public EnergyReading(DataCenter datacenter, Instant measuredAt, BigDecimal total, BigDecimal it) {
        this.datacenter = datacenter; this.measuredAt = measuredAt; this.energyTotalKwh = total; this.energyItKwh = it;
    }
    public Integer getId() { return id; }
    public DataCenter getDatacenter() { return datacenter; }
    public Instant getMeasuredAt() { return measuredAt; }
    public BigDecimal getEnergyTotalKwh() { return energyTotalKwh; }
    public BigDecimal getEnergyItKwh() { return energyItKwh; }
}
