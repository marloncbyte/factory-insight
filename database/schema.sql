-- Banco: energiadc (PostgreSQL/Amazon RDS)
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

-- Dados demonstrativos: três leituras recentes para um datacenter.
INSERT INTO datacenters (name, location, electricity_tariff, pue_limit)
VALUES ('DC Sao Paulo', 'São Paulo - SP', 0.82, 1.80)
ON CONFLICT (name) DO UPDATE SET
    location = EXCLUDED.location,
    electricity_tariff = EXCLUDED.electricity_tariff,
    pue_limit = EXCLUDED.pue_limit;

INSERT INTO energy_readings (datacenter_id, measured_at, energy_total_kwh, energy_it_kwh)
SELECT d.id, v.measured_at, v.total_kwh, v.it_kwh
FROM datacenters d
CROSS JOIN (VALUES
    (CURRENT_TIMESTAMP - INTERVAL '3 hours', 125.000::NUMERIC, 80.000::NUMERIC),
    (CURRENT_TIMESTAMP - INTERVAL '2 hours', 132.000::NUMERIC, 82.000::NUMERIC),
    (CURRENT_TIMESTAMP - INTERVAL '1 hour', 200.000::NUMERIC, 85.000::NUMERIC)
) AS v(measured_at, total_kwh, it_kwh)
WHERE d.name = 'DC Sao Paulo'
ON CONFLICT (datacenter_id, measured_at) DO NOTHING;

-- Grava alerta da medição mais recente se ela ultrapassar o limite de PUE.
INSERT INTO alerts (reading_id, alert_type, severity, message)
SELECT r.id, 'PUE_ABOVE_LIMIT', 'warning',
       'PUE da leitura (2.35) acima do limite configurado (1.80).'
FROM energy_readings r
JOIN datacenters d ON d.id = r.datacenter_id
WHERE d.name = 'DC Sao Paulo'
  AND r.measured_at = (
      SELECT MAX(r2.measured_at)
      FROM energy_readings r2
      WHERE r2.datacenter_id = d.id
  )
  AND NOT EXISTS (
      SELECT 1 FROM alerts a
      WHERE a.reading_id = r.id AND a.alert_type = 'PUE_ABOVE_LIMIT'
  );
