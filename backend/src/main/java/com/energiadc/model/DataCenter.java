package com.energiadc.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "datacenters")
public class DataCenter {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Column(nullable = false, unique = true, length = 120)
    private String name;
    @Column(nullable = false, length = 160)
    private String location;
    @Column(name = "electricity_tariff", nullable = false, precision = 10, scale = 4)
    private BigDecimal electricityTariff;
    @Column(name = "pue_limit", nullable = false, precision = 5, scale = 2)
    private BigDecimal pueLimit;
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;
    @OneToMany(mappedBy = "datacenter")
    private List<EnergyReading> readings = new ArrayList<>();

    protected DataCenter() {}
    public DataCenter(String name, String location, BigDecimal electricityTariff, BigDecimal pueLimit) {
        this.name = name; this.location = location; this.electricityTariff = electricityTariff;
        this.pueLimit = pueLimit; this.createdAt = Instant.now();
    }
    public Integer getId() { return id; }
    public String getName() { return name; }
    public String getLocation() { return location; }
    public BigDecimal getElectricityTariff() { return electricityTariff; }
    public BigDecimal getPueLimit() { return pueLimit; }
}
