# Modelo de classes — EnergiaDC Java

## Classes de domínio

### DataCenter

Representa o datacenter e armazena nome, localização, tarifa elétrica e limite de PUE. Um datacenter pode possuir várias medições.

### EnergyReading

Representa uma medição em determinado instante. Armazena consumo total e consumo de TI, pertence a um datacenter e pode estar relacionada a alertas.

### Alert

Registra um alerta relacionado a uma medição, incluindo tipo, severidade, mensagem e instante de criação.

## Classes de aplicação

- **EnergySummaryService:** consulta medições do período, calcula consumo total, consumo de TI, PUE e custo estimado e prepara o alerta do resumo.
- **MonitoringService:** lista medições e alertas, registra novas medições, valida os valores e executa a simulação de sensores.
- **EnergyController:** disponibiliza a rota de resumo energético.
- **MonitoringController:** disponibiliza as rotas de consulta, registro e simulação de medições e consulta de alertas.
- **HealthController:** disponibiliza a verificação de saúde da API.
- **ApiExceptionHandler:** padroniza respostas de erros da API.

## Relacionamentos

~~~mermaid
classDiagram
    DataCenter "1" --> "0..*" EnergyReading : possui
    EnergyReading "1" --> "0..*" Alert : pode gerar

    class DataCenter {
        Integer id
        String name
        String location
        BigDecimal electricityTariff
        BigDecimal pueLimit
    }
    class EnergyReading {
        Integer id
        Instant measuredAt
        BigDecimal energyTotalKwh
        BigDecimal energyItKwh
    }
    class Alert {
        Integer id
        String alertType
        String severity
        String message
        Instant createdAt
    }
~~~

## Restrições

- electricity_tariff deve ser maior ou igual a zero.
- pue_limit deve ser igual ou superior a 1.
- energy_total_kwh e energy_it_kwh devem ser positivos.
- energy_total_kwh deve ser maior ou igual a energy_it_kwh.
- A combinação (datacenter_id, measured_at) possui restrição de unicidade.
