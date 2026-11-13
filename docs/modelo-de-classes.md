# Modelo de classes — EnergiaDC Java

## Classes e responsabilidades

- **DataCenter**: representa o datacenter e guarda nome, local, tarifa elétrica e limite de PUE.
- **EnergyReading**: representa uma medição horária de consumo total e de TI vinculada a um datacenter.
- **Alert**: registra o tipo, severidade e mensagem de um alerta associado a uma medição.
- **EnergySummaryService**: consulta as medições no período, calcula PUE e custo e prepara o alerta.
- **EnergyController**: publica o endpoint de resumo energético.
- **HealthController**: publica a verificação de saúde da API.

## Relacionamentos

- Um `DataCenter` possui várias `EnergyReading`.
- Uma `EnergyReading` pertence a um `DataCenter` e pode ter vários `Alert`.

## Restrições

- `electricity_tariff >= 0` e `pue_limit >= 1`.
- `energy_total_kwh > 0`, `energy_it_kwh > 0` e `energy_total_kwh >= energy_it_kwh`.
- Restrição única em `(datacenter_id, measured_at)`.
