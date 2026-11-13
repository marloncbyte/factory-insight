-- Schema PostgreSQL equivalente ao banco usado pelo backend Python.
CREATE TABLE IF NOT EXISTS datacenters (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL UNIQUE,
    location VARCHAR(160) NOT NULL,
    electricity_tariff NUMERIC(10,4) NOT NULL CHECK (electricity_tariff >= 0),
    pue_limit NUMERIC(5,2) NOT NULL DEFAULT 1.80 CHECK (pue_limit >= 1),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS energy_readings (
    id SERIAL PRIMARY KEY,
    datacenter_id INTEGER NOT NULL REFERENCES datacenters(id) ON DELETE CASCADE,
    measured_at TIMESTAMPTZ NOT NULL,
    energy_total_kwh NUMERIC(12,3) NOT NULL CHECK (energy_total_kwh > 0),
    energy_it_kwh NUMERIC(12,3) NOT NULL CHECK (energy_it_kwh > 0),
    CONSTRAINT ck_reading_total_gte_it CHECK (energy_total_kwh >= energy_it_kwh),
    CONSTRAINT uq_reading_datacenter_timestamp UNIQUE (datacenter_id, measured_at)
);
CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    reading_id INTEGER NOT NULL REFERENCES energy_readings(id) ON DELETE CASCADE,
    alert_type VARCHAR(40) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    message VARCHAR(500) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
