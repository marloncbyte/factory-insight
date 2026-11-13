package com.energiadc.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "alerts")
public class Alert {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "reading_id", nullable = false, foreignKey = @ForeignKey(name = "fk_alert_reading"))
    private EnergyReading reading;
    @Column(name = "alert_type", nullable = false, length = 40)
    private String alertType;
    @Column(nullable = false, length = 20)
    private String severity;
    @Column(nullable = false, length = 500)
    private String message;
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected Alert() {}
    public Alert(EnergyReading reading, String alertType, String severity, String message) {
        this.reading = reading; this.alertType = alertType; this.severity = severity;
        this.message = message; this.createdAt = Instant.now();
    }
}
