# Banco de dados

O esquema SQL está em [`../database/schema.sql`](../database/schema.sql).

## Entidades principais

- **datacenters:** identificação, localização, tarifa elétrica e limite de PUE.
- **energy_readings:** medições de consumo total e consumo de TI, associadas a um datacenter e a um instante.
- **alerts:** alertas associados a uma medição, com tipo, severidade e mensagem.

## Restrições relevantes

- Os consumos devem ser positivos.
- O consumo total deve ser maior ou igual ao consumo de TI.
- Não pode haver duas medições para o mesmo datacenter no mesmo instante.
- O limite de PUE deve ser igual ou superior a 1.

O arquivo SQL contém também registros demonstrativos. Antes de executá-lo em um banco existente, revise o conteúdo e faça backup quando necessário.
