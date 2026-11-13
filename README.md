<div align="center">

# Factory Insight

### Plataforma de monitoramento e análise de indicadores industriais

**Projeto Integrador · Análise e Desenvolvimento de Sistemas · 2º semestre**

Módulo desenvolvido pelo grupo: **EnergiaDC — monitoramento energético de datacenters**

</div>

---

## Sobre o projeto

O **Factory Insight** é o projeto integrador acadêmico voltado à organização e visualização de indicadores industriais. Neste repositório está documentado o módulo **EnergiaDC**, desenvolvido pelo grupo para consultar e apresentar indicadores de consumo energético de um datacenter.

A aplicação reúne uma interface web em React, uma API REST em Java com Spring Boot e um banco de dados relacional. O objetivo desta etapa é transformar os registros de consumo em informações que possam ser acompanhadas por meio de indicadores, gráficos e alertas.

> Este repositório registra o desenvolvimento do módulo EnergiaDC dentro do projeto maior Factory Insight. O escopo e o status descritos aqui se limitam ao material e às validações disponíveis nesta versão.

## Visão geral da aplicação

A interface apresenta:
- Indicadores de consumo total, consumo de TI, PUE e custo estimado;
- Seleção de período para atualizar a consulta;
- Gráfico de comparação entre consumo total e consumo de TI;
- Gráfico de distribuição entre TI e demais cargas;
- Exibição do período consultado e da quantidade de medições;
- Aviso quando o PUE calculado ultrapassa o limite configurado;
- Indicador visual do estado da conexão com a API.

### Tela do dashboard

![Dashboard EnergiaDC integrado à API Java e ao banco RDS](evidencias/dashboard_integrado_java_rds.png)

*Captura de evidência da integração registrada em 06/11/2026. Os valores exibidos correspondem à consulta validada naquele momento.*

## Como os componentes se comunicam

```text
Usuário
   |
   v
Frontend (React + Vite)
   |
   | Requisição HTTP / JSON
   v
Backend (Java + Spring Boot)
   |
   | Spring Data JPA
   v
Banco relacional (PostgreSQL / Amazon RDS)
```

Na execução local, o backend também pode utilizar H2 para demonstração. A configuração de conexão é feita por variáveis de ambiente.

## Tecnologias utilizadas

| Camada | Tecnologias |
|---|---|
| Frontend | React, Vite, Recharts |
| Backend | Java 21, Spring Boot, Spring Web |
| Persistência | Spring Data JPA / Hibernate |
| Banco de dados | PostgreSQL (RDS) e H2 para execução local |
| Documentação da API | Springdoc / OpenAPI / Swagger UI |
| Versionamento | Git e GitHub |

## Estrutura do repositório

```text
factory-insight/
├── backend/
│   ├── src/
│   ├── pom.xml
│   ├── .env.example
│   └── iniciar_windows.bat
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── .env.example
├── database/
│   └── schema.sql
├── docs/
│   ├── modelo-de-classes.md
│   └── relatorio-tecnico.md
├── evidencias/
├── .gitignore
└── README.md
```

## Funcionalidades e API

### Endpoint principal

`GET /api/datacenters/{datacenter_id}/energy-summary`

Parâmetros de consulta:
- `start`: início do período em formato ISO 8601;
- `end`: fim do período em formato ISO 8601.

O endpoint retorna informações do datacenter, período, quantidade de medições, consumo total, consumo de TI, PUE, limite configurado, custo estimado e possível alerta.

### Endpoint de saúde

`GET /health`

Verifica se a API está respondendo.

### Documentação interativa

Com o backend em execução, a documentação Swagger UI fica disponível em `/docs` e a especificação OpenAPI em `/openapi.json`.

## Indicadores calculados

- **PUE:** consumo total dividido pelo consumo de TI.
- **Custo estimado:** consumo total em kWh multiplicado pela tarifa cadastrada em R$/kWh.
- **Alerta de PUE:** é retornado quando o PUE calculado ultrapassa o limite configurado para o datacenter.

## Evidências de validação

A pasta [`evidencias/`](evidencias/) reúne registros e capturas de validação. Entre eles:

- `validacao_java_rds.txt`: registro da consulta realizada pela API Java ao PostgreSQL no Amazon RDS;
- `validacao_integracao_front_back.txt`: registro da tela React consumindo a API Java;
- `dashboard_integrado_java_rds.png`: captura do dashboard com o estado de API conectada;
- `api_java_rds_resposta.png`: captura da resposta da API Java.

Há também arquivos identificados como históricos da versão Python anterior. Eles foram mantidos como referência e **não devem ser confundidos com a validação da versão Java atual**.

## Como executar localmente

### Pré-requisitos

- JDK 21;
- Maven;
- Node.js compatível com a versão do Vite utilizada;
- Corepack / pnpm.

### 1. Backend

No terminal, entre na pasta `backend`:

```powershell
cd backend
Copy-Item .env.example .env
```

O arquivo de exemplo utiliza H2 local por padrão. Para iniciar:

```powershell
mvn spring-boot:run
```

A API ficará disponível em `http://localhost:8000`.

### 2. Frontend

Em outro terminal, entre na pasta `frontend`:

```powershell
cd frontend
Copy-Item .env.example .env
corepack pnpm install
corepack pnpm dev
```

Abra o endereço local informado pelo Vite no terminal. A configuração de exemplo aponta para a API em `http://127.0.0.1:8000`.

### 3. Conexão com Amazon RDS

Para utilizar um banco remoto, configure as variáveis de conexão no arquivo `.env` do backend, seguindo o modelo de `.env.example`. Não coloque senhas, certificados ou arquivos `.env` reais no GitHub.

As configurações de rede e acesso ao RDS devem permitir a conexão somente a partir das origens autorizadas.

## Observações sobre o escopo atual

- O login presente no frontend é uma simulação local; não representa autenticação validada pelo backend.
- A API disponibiliza um resumo agregado por período. Portanto, os gráficos atuais representam os totais retornados pela API, e não uma série histórica detalhada por hora.
- A interface contém opções de navegação visual, mas as telas de Racks, Histórico e Relatórios não devem ser consideradas módulos funcionais completos nesta versão.
- A evidência de integração com RDS registra um teste realizado em 06/11/2026. Ela não garante que a infraestrutura esteja disponível continuamente.
- Não estão sendo declaradas como concluídas etapas futuras do cronograma do Projeto Integrador.

## Documentação complementar

- [Relatório técnico do backend](docs/relatorio-tecnico.md)
- [Modelo de classes](docs/modelo-de-classes.md)
- [Script de criação do banco](database/schema.sql)
- [Evidências de validação](evidencias/LEIA-ME.txt)

---

## Projeto acadêmico

Desenvolvido como parte do **Projeto Integrador do curso de Análise e Desenvolvimento de Sistemas — 2º semestre**.

**Factory Insight** é o nome do projeto integrador. **EnergiaDC** identifica o módulo desenvolvido e documentado neste repositório.

*Repositório destinado à documentação e ao versionamento do desenvolvimento acadêmico do grupo.*
