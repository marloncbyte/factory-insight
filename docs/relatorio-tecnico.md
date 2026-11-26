# Relatório técnico — EnergiaDC

## 1. Objetivo

O EnergiaDC é um módulo do projeto integrador Factory Insight. Ele fornece uma aplicação web e uma API REST para consultar e registrar medições de energia de datacenters e calcular indicadores de eficiência energética.

## 2. Tecnologias

- Java 21 e Spring Boot 3.5;
- Spring Web para disponibilização das rotas REST;
- Spring Data JPA e Hibernate para persistência;
- PostgreSQL no Amazon RDS para ambiente remoto;
- H2 para execução local de demonstração;
- React 19 e Vite 8 para o frontend;
- Recharts para gráficos;
- Springdoc, OpenAPI e Swagger UI para documentação da API.

## 3. Arquitetura

A aplicação está organizada em frontend, backend e banco de dados.

No backend, o pacote está dividido em controllers, DTOs, models, repositories, services e configurações. O frontend consulta a API por HTTP e apresenta os dados recebidos.

## 4. Modelo de dados

O sistema utiliza três entidades:

- **DataCenter:** identificação, localização, tarifa elétrica e limite de PUE;
- **EnergyReading:** consumo total, consumo de TI e instante da medição;
- **Alert:** tipo, severidade, mensagem e vínculo com a medição que originou o alerta.

Um datacenter possui várias medições. Uma medição pode gerar alertas.

## 5. Regras de negócio

1. Os consumos total e de TI devem ser positivos.
2. O consumo total deve ser maior ou igual ao consumo de TI.
3. Não pode haver duas medições do mesmo datacenter no mesmo instante.
4. PUE = consumo total / consumo de TI.
5. Custo estimado = consumo total em kWh × tarifa em R$/kWh.
6. Um alerta é criado quando o PUE de uma medição ultrapassa o limite do datacenter.
7. A severidade do alerta é warning ou critical conforme o quanto o PUE excede o limite.
8. Os parâmetros start e end devem estar em ISO 8601 e o início deve ser anterior ao fim.

## 6. Funcionalidades da API

- GET /health: verifica a disponibilidade da API.
- GET /api/datacenters/{id}/energy-summary: retorna resumo energético do período.
- GET /api/datacenters/{id}/readings: lista medições do período.
- POST /api/datacenters/{id}/readings: registra uma medição e verifica a necessidade de alerta.
- POST /api/datacenters/{id}/readings/simulate: gera medições horárias demonstrativas.
- GET /api/datacenters/{id}/alerts: lista alertas do datacenter.
- GET /docs: disponibiliza a documentação Swagger UI.
- GET /openapi.json: disponibiliza a especificação OpenAPI.

## 7. Frontend

O painel está organizado em quatro áreas: Visão Geral, Histórico, Alertas e Relatórios. A Visão Geral apresenta indicadores e gráficos; Histórico permite consultar, registrar e simular medições; Alertas apresenta os registros de alerta; Relatórios consolida valores por dia e permite exportar os dados em CSV.

O login do frontend é uma simulação local e não implementa autenticação no backend. A simulação de sensores gera dados demonstrativos e não representa conexão com sensores físicos.

## 8. Banco de dados e execução

O H2 é utilizado por padrão na execução local. Para utilizar PostgreSQL remoto, configure DB_URL, DB_USERNAME e DB_PASSWORD por variáveis de ambiente. O arquivo .env deve permanecer fora do controle de versão.

O backend utiliza a porta 8000 por padrão. O frontend utiliza a porta 8443 conforme a configuração do Vite. O CORS permite as origens definidas em CORS_ALLOWED_ORIGINS.

## 9. Validação registrada

Em 06/11/2026, a versão Java/Spring Boot foi iniciada conectada ao Amazon RDS PostgreSQL 18.3 e validada pelo endpoint GET /api/datacenters/1/energy-summary.

O registro de validação informa três medições do datacenter DC Sao Paulo: 457 kWh de consumo total, 247 kWh de consumo de TI, PUE 1,85, custo estimado de R$ 374,74 e alerta PUE_ABOVE_LIMIT com severidade warning, acima do limite configurado de 1,80.

A integração do frontend React/Vite com a API Java também foi registrada em 06/11/2026. A captura mostra o estado API CONECTADA e os indicadores retornados pelo backend.

Os registros e capturas estão na pasta evidencias/. Eles comprovam os testes documentados naquela data, mas não garantem disponibilidade contínua do ambiente RDS.

## 10. Organização das evidências

- validacao_java_rds.txt e api_java_rds_resposta.png: validação da API Java conectada ao RDS;
- validacao_integracao_front_back.txt e dashboard_integrado_java_rds.png: validação da integração do frontend com a API Java;
- validacao_api.txt e api_rds_resposta_200.png: histórico da versão Python anterior à migração.
