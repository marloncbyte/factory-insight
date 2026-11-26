# Arquitetura e integração — EnergiaDC

## Visão geral

O EnergiaDC é o módulo do Factory Insight organizado em três camadas: frontend, backend e banco de dados.

~~~text
Pessoa usuária
     |
     v
React + Vite
     |
     | HTTP / JSON
     v
Java 21 + Spring Boot
     |
     | Spring Data JPA / Hibernate
     v
PostgreSQL (Amazon RDS) ou H2 local
~~~

## Responsabilidades

### Frontend

A aplicação React apresenta quatro áreas:

- **Visão Geral:** indicadores, gráficos e últimas medições;
- **Histórico:** listagem, registro manual e simulação de medições;
- **Alertas:** consulta dos alertas e sua severidade;
- **Relatórios:** consolidação diária e exportação CSV.

O frontend consulta a API usando a URL configurada em VITE_API_BASE_URL e o identificador definido em VITE_DATACENTER_ID.

### Backend

A API Java/Spring Boot concentra as regras de negócio. Os controllers recebem as requisições, os services validam e processam os dados, os repositories acessam o banco e os DTOs definem os formatos de entrada e saída.

### Banco de dados

O modelo relacional utiliza datacenters, energy_readings e alerts. O backend pode utilizar H2 localmente ou PostgreSQL no ambiente remoto, conforme DB_URL e demais variáveis de ambiente.

## Fluxo de consulta

1. A pessoa usuária seleciona um período no painel.
2. O frontend calcula os instantes inicial e final e envia-os em ISO 8601.
3. A API consulta o datacenter e as medições do período.
4. Os serviços calculam PUE, custo e alertas aplicáveis.
5. A API devolve os resultados em JSON.
6. O frontend atualiza os indicadores, tabelas e gráficos.

## Fluxo de registro de medição

1. O frontend envia os consumos total e de TI para a rota de leituras.
2. O backend valida se os valores foram informados, são positivos e respeitam a relação entre consumo total e consumo de TI.
3. A API verifica se já existe uma leitura para o mesmo datacenter e instante.
4. A medição é persistida.
5. O backend verifica o PUE da leitura e registra um alerta quando o limite é ultrapassado.

## Configuração e segurança

- A URL, usuário e senha do banco são definidos por variáveis de ambiente.
- O arquivo .env real não deve ser versionado.
- CORS é configurado por CORS_ALLOWED_ORIGINS.
- O login atual do frontend é demonstrativo e não equivale a autenticação no backend.
- O acesso ao RDS deve ser limitado por regras de rede apropriadas.

## Limites da implementação

A simulação de sensores gera registros demonstrativos no banco; ela não representa conexão com sensores físicos. A evidência de integração com Amazon RDS documenta um teste pontual realizado em 06/11/2026, não disponibilidade permanente do serviço.
