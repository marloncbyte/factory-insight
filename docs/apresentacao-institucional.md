# Apresentação institucional — Factory Insight

## 1. Identificação do projeto

| Item | Informação |
|---|---|
| Projeto Integrador | Factory Insight |
| Módulo desenvolvido e documentado | EnergiaDC |
| Curso | Superior de Tecnologia em Análise e Desenvolvimento de Sistemas |
| Instituição | Escola SENAI "Armando de Arruda Pereira" |
| Localidade | São Paulo — SP |

## 2. Contextualização

O **Factory Insight** é o projeto integrador acadêmico voltado à organização e visualização de indicadores industriais. Este repositório apresenta o módulo **EnergiaDC**, desenvolvido pela equipe como parte do projeto principal.

O EnergiaDC concentra-se no monitoramento e na análise de indicadores de consumo energético de um datacenter. A aplicação reúne interface web, API REST e banco de dados relacional.

## 3. Objetivo do módulo

Disponibilizar uma aplicação que consulte medições de consumo energético e apresente informações que auxiliem a análise da eficiência do datacenter, incluindo consumo total, consumo de TI, PUE, custo estimado e alertas.

## 4. Solução desenvolvida

A solução está dividida em três camadas:

1. **Frontend:** painel web em React e Vite, com áreas de Visão Geral, Histórico, Alertas e Relatórios.
2. **Backend:** API REST em Java 21 e Spring Boot, responsável pelas consultas, validações, cálculos e registro de medições.
3. **Banco de dados:** persistência relacional com PostgreSQL no ambiente remoto e H2 para execução local de demonstração.

## 5. Funcionalidades apresentadas

- Consulta de indicadores energéticos por período;
- Visualização de consumo total e consumo de TI;
- Cálculo do índice PUE e do custo estimado;
- Registro manual de medições;
- Simulação de leituras horárias;
- Consulta de alertas e severidade;
- Consolidação diária e exportação de relatório CSV.

## 6. Tecnologias

Java 21, Spring Boot, Spring Data JPA, Hibernate, PostgreSQL, H2, React, Vite, Recharts, Tailwind CSS, OpenAPI, Git e GitHub.

## 7. Evidências

As capturas e os registros de validação estão organizados na pasta [evidencias/](../evidencias/). As evidências identificadas como Java registram a execução da API Java e a integração do painel com o backend. Os arquivos identificados como versão Python são registros históricos da etapa anterior.

## 8. Integrantes

1. Marlon Carvalho de Farias
2. Leonardo da Silva
3. Pedro Henrique Gomes dos Santos
4. Victor de Freitas Queijo
5. Patrick Romano Silva
6. Lucas Siqueira Apolinário

## 9. Demonstração em vídeo

*Espaço reservado para inserir o link da apresentação em vídeo após a gravação e publicação pela equipe.*

## 10. Identidade institucional

A identificação visual institucional deve respeitar as orientações do [Manual de Identidade Visual SENAI-SP](https://www.sp.senai.br/noticia/manual-de-identidade-visual).
