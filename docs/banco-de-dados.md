# Banco de dados — EnergiaDC

O esquema de criação está em [database/schema.sql](../database/schema.sql). O backend também possui uma configuração H2 para execução local e demonstração.

## Entidades

### datacenters

Armazena os dados de cada datacenter:

- identificador;
- nome;
- localização;
- tarifa elétrica;
- limite de PUE;
- data de criação.

### energy_readings

Armazena cada medição de consumo:

- datacenter relacionado;
- instante da medição;
- consumo total em kWh;
- consumo de TI em kWh.

A combinação de datacenter e instante da medição é única.

### alerts

Armazena alertas relacionados a uma medição:

- tipo do alerta;
- severidade;
- mensagem;
- data de criação;
- identificador da medição relacionada.

## Relacionamentos

- Um datacenter pode possuir várias medições.
- Cada medição pertence a um datacenter.
- Uma medição pode gerar zero ou mais alertas.
- Cada alerta está associado a uma medição.

## Restrições de negócio

- Tarifa elétrica não pode ser negativa.
- Limite de PUE deve ser igual ou superior a 1.
- Consumos total e de TI devem ser positivos.
- Consumo total deve ser maior ou igual ao consumo de TI.
- Não pode haver duas medições do mesmo datacenter no mesmo instante.

## Cálculos

- **PUE:** consumo total dividido pelo consumo de TI.
- **Custo estimado:** consumo total em kWh multiplicado pela tarifa em R$/kWh.
- **Alerta:** criado quando o PUE de uma medição ultrapassa o limite configurado. A severidade pode ser warning ou critical.

## Execução e configuração

Para execução local, o backend utiliza H2 por padrão. Para banco remoto PostgreSQL, configure DB_URL, DB_USERNAME e DB_PASSWORD por variáveis de ambiente. Não publique credenciais ou arquivos .env.

O script SQL contém comandos de criação e registros demonstrativos. Antes de executá-lo em uma base existente, revise o conteúdo e faça backup quando necessário.
