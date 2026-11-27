# Factory Insight

<div align="center">

<img src="https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8c/SENAI_S%C3%A3o_Paulo_logo.png/960px-SENAI_S%C3%A3o_Paulo_logo.png" alt="Logotipo SENAI São Paulo" width="230">

## Plataforma de monitoramento e análise de indicadores industriais

**Projeto Integrador · Superior de Tecnologia em Análise e Desenvolvimento de Sistemas**  
**Escola SENAI "Armando de Arruda Pereira"**

**Módulo apresentado neste repositório: EnergiaDC**

</div>

---

## Navegação

- [Sobre o Factory Insight](#sobre-o-factory-insight)
- [Módulo EnergiaDC](#módulo-energiadc)
- [Demonstração](#demonstração)
- [Funcionalidades](#funcionalidades)
- [Arquitetura e tecnologias](#arquitetura-e-tecnologias)
- [Estrutura do repositório](#estrutura-do-repositório)
- [Como executar](#como-executar)
- [Rotas da API](#rotas-da-api)
- [Banco de dados e regras de negócio](#banco-de-dados-e-regras-de-negócio)
- [Validação e evidências](#validação-e-evidências)
- [Equipe](#equipe)
- [Documentação complementar](#documentação-complementar)

## Sobre o Factory Insight

O **Factory Insight** é o projeto integrador acadêmico desenvolvido no curso Superior de Tecnologia em Análise e Desenvolvimento de Sistemas. A proposta é organizar e apresentar indicadores relacionados a processos industriais por meio de soluções de software.

Este repositório registra o desenvolvimento do módulo **EnergiaDC**, que faz parte do Factory Insight. Portanto, Factory Insight é o projeto integrador principal e EnergiaDC é o módulo desenvolvido e documentado aqui — não são projetos independentes.

## Módulo EnergiaDC

O EnergiaDC é uma aplicação para monitoramento e análise do consumo energético de um datacenter. A solução integra uma interface web, uma API REST e um banco de dados relacional.

A aplicação consulta medições, calcula indicadores de eficiência energética e apresenta os resultados em um painel. O principal indicador utilizado é o **PUE (Power Usage Effectiveness)**, calculado pela divisão do consumo total de energia pelo consumo de energia de TI.

## Demonstração

![Painel EnergiaDC integrado à API Java e ao banco RDS](evidencias/dashboard_integrado_java_rds.png)

*Evidência da integração registrada em 06/11/2026. A imagem documenta o resultado do teste realizado naquela data; não representa disponibilidade contínua do ambiente remoto.*

## Funcionalidades

O painel React está organizado em quatro áreas:

| Área | O que permite fazer |
|---|---|
| **Visão Geral** | Consultar consumo total, consumo de TI, PUE, custo estimado, distribuição energética, alertas e últimas medições. |
| **Histórico** | Consultar medições do período, registrar uma nova leitura, visualizar o PUE previsto e simular leituras horárias de sensores. |
| **Alertas** | Consultar os alertas registrados, com tipo, severidade, mensagem e data da medição relacionada. |
| **Relatórios** | Consolidar consumo e custo por dia e exportar os dados do período em CSV. |

O painel oferece períodos de consulta de 24 horas, 7 dias, 30 dias e 90 dias. Os dados são carregados a partir da API Java.

**Observação sobre o acesso:** o formulário de login do frontend é uma simulação local para demonstração. Ele não implementa autenticação real no backend nem deve ser utilizado como mecanismo de segurança.

## Arquitetura e tecnologias

~~~text
Usuário
   |
   v
Frontend — React + Vite
   |  HTTP / JSON
   v
Backend — Java 21 + Spring Boot
   |  Spring Data JPA / Hibernate
   v
Banco relacional — PostgreSQL (Amazon RDS)
                  H2 (execução local)
~~~

| Camada | Tecnologias |
|---|---|
| Frontend | React 19, Vite 8, Recharts, Tailwind CSS |
| Backend | Java 21, Spring Boot 3.5, Spring Web |
| Persistência | Spring Data JPA e Hibernate |
| Banco remoto | PostgreSQL no Amazon RDS |
| Banco local | H2 |
| Documentação da API | Springdoc, OpenAPI e Swagger UI |
| Versionamento | Git e GitHub |

## Estrutura do repositório

~~~text
factory-insight/
├── backend/
│   ├── src/main/java/com/energiadc/
│   │   ├── config/
│   │   ├── controller/
│   │   ├── dto/
│   │   ├── model/
│   │   ├── repository/
│   │   └── service/
│   ├── src/main/resources/
│   ├── .env.example
│   ├── iniciar_windows.bat
│   └── pom.xml
├── frontend/
│   ├── src/components/
│   ├── src/
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
├── database/
│   └── schema.sql
├── docs/
│   ├── apresentacao-institucional.md
│   ├── arquitetura-e-integracao.md
│   ├── banco-de-dados.md
│   ├── modelo-de-classes.md
│   └── relatorio-tecnico.md
├── evidencias/
└── README.md
~~~

## Como executar

### Pré-requisitos

- JDK 21;
- Apache Maven;
- Node.js compatível com Vite 8;
- npm (instalado junto com o Node.js).

Verifique as instalações no PowerShell:

~~~powershell
java -version
mvn -version
node -version
npm --version
~~~

### 1. Configurar e iniciar o backend

Abra um terminal na pasta do backend:

~~~powershell
cd backend
Copy-Item .env.example .env
~~~

O arquivo de exemplo utiliza H2 local por padrão. Para utilizar outro banco, ajuste as variáveis no arquivo .env. Não publique o arquivo .env preenchido com credenciais.

Inicie a API:

~~~powershell
mvn spring-boot:run
~~~

A API ficará disponível em:

- API: http://localhost:8000
- Saúde: http://localhost:8000/health
- Swagger UI: http://localhost:8000/docs
- OpenAPI: http://localhost:8000/openapi.json

Na primeira execução com o banco H2 vazio, o inicializador cria dados demonstrativos quando ainda não existe um datacenter cadastrado.

### 2. Configurar e iniciar o frontend

Em outro terminal, na raiz do repositório:

~~~powershell
cd frontend
Copy-Item .env.example .env
npm install
npm run dev
~~~

Abra http://localhost:8443. O frontend utiliza, por padrão, a API em http://127.0.0.1:8000 e o datacenter de ID 1. Essas configurações podem ser alteradas em frontend/.env.

### 3. Conexão com Amazon RDS

O backend aceita configuração por variáveis de ambiente. Para o ambiente PostgreSQL documentado, configure DB_URL, DB_USERNAME, DB_PASSWORD e DDL_AUTO de acordo com a instância utilizada. Para uma base já existente, a configuração de validação do esquema evita que o Hibernate tente alterar automaticamente as tabelas.

A conexão remota também depende das regras de rede e do grupo de segurança do RDS. Libere acesso somente para as origens necessárias; não utilize regras abertas para toda a internet. Não envie senhas, chaves, certificados privados ou arquivos .env para o GitHub.

## Rotas da API

Todas as rotas de dados utilizam o identificador do datacenter na URL.

| Método | Rota | Finalidade |
|---|---|---|
| GET | /health | Verifica se a API está ativa. |
| GET | /api/datacenters/{id}/energy-summary?start=...&end=... | Retorna o resumo energético do período. |
| GET | /api/datacenters/{id}/readings?start=...&end=... | Lista as medições do período. |
| POST | /api/datacenters/{id}/readings | Registra uma medição e verifica se deve gerar alerta. |
| POST | /api/datacenters/{id}/readings/simulate?hours=24 | Simula medições horárias para as últimas horas informadas. |
| GET | /api/datacenters/{id}/alerts | Lista os alertas registrados para o datacenter. |

Os parâmetros start e end devem estar no formato ISO 8601 com fuso horário. O intervalo considera o início inclusivo e o fim exclusivo.

Exemplo de corpo para registrar uma medição:

~~~json
{
  "energy_total_kwh": 200,
  "energy_it_kwh": 90
}
~~~

O campo measured_at é opcional. Quando omitido, a API utiliza o instante atual.

## Banco de dados e regras de negócio

O modelo utiliza três entidades principais:

- **datacenters:** nome, localização, tarifa elétrica e limite de PUE;
- **energy_readings:** consumo total, consumo de TI e instante da medição;
- **alerts:** tipo, severidade, mensagem e referência à medição que originou o alerta.

Regras principais:

1. Os consumos total e de TI devem ser positivos.
2. O consumo total deve ser maior ou igual ao consumo de TI.
3. Não são permitidas duas medições do mesmo datacenter no mesmo instante.
4. PUE = consumo total / consumo de TI.
5. Custo estimado = consumo total em kWh × tarifa em R$/kWh.
6. A API gera alerta quando o PUE de uma medição ultrapassa o limite configurado. A severidade é warning ou critical conforme a diferença em relação ao limite.

O esquema SQL está em [database/schema.sql](database/schema.sql).

## Validação e evidências

A pasta [evidencias/](evidencias/) reúne capturas e registros das validações realizadas:

- **validacao_java_rds.txt** e **api_java_rds_resposta.png:** execução da API Java conectada ao PostgreSQL no Amazon RDS;
- **validacao_integracao_front_back.txt** e **dashboard_integrado_java_rds.png:** painel React consumindo a API Java e exibindo os indicadores retornados;
- **validacao_api.txt** e **api_rds_resposta_200.png:** registro histórico da versão Python anterior à migração para Java.

Os arquivos da versão Python foram mantidos como histórico e não devem ser interpretados como evidência da execução atual em Java.

## Equipe

| Integrante |
|---|
| Marlon Carvalho de Farias |
| Leonardo da Silva |
| Pedro Henrique Gomes dos Santos |
| Victor de Freitas Queijo |
| Patrick Romano Silva |
| Lucas Siqueira Apolinário |

**Curso:** Superior de Tecnologia em Análise e Desenvolvimento de Sistemas  
**Instituição:** Escola SENAI "Armando de Arruda Pereira"  
**Projeto Integrador:** Factory Insight  
**Módulo documentado:** EnergiaDC

## Documentação complementar

- [Apresentação institucional](docs/apresentacao-institucional.md)
- [Arquitetura e integração](docs/arquitetura-e-integracao.md)
- [Banco de dados](docs/banco-de-dados.md)
- [Modelo de classes](docs/modelo-de-classes.md)
- [Relatório técnico](docs/relatorio-tecnico.md)
- [Evidências de validação](evidencias/LEIA-ME.txt)

---

<div align="center">

**Factory Insight · Módulo EnergiaDC**  
Projeto Integrador — Escola SENAI "Armando de Arruda Pereira"

</div>
