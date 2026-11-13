# Arquitetura e integração

O módulo EnergiaDC está organizado em três partes:

1. **Frontend:** aplicação React com Vite. Consulta a API por HTTP e apresenta os indicadores recebidos.
2. **Backend:** API REST em Java 21 e Spring Boot. Recebe os parâmetros de período, consulta as medições e calcula os indicadores.
3. **Banco de dados:** PostgreSQL no ambiente remoto (Amazon RDS) e H2 como opção local de demonstração.

## Fluxo da consulta

1. O usuário seleciona um período no painel.
2. O frontend monta os parâmetros `start` e `end`.
3. O frontend chama `GET /api/datacenters/{id}/energy-summary`.
4. O backend consulta as medições e os dados do datacenter.
5. O serviço calcula consumo total, consumo de TI, PUE, custo estimado e alerta.
6. A API devolve JSON e o frontend atualiza os cartões, gráficos e avisos.

## Limite da implementação documentada

A API atual retorna um resumo agregado do período. O painel não recebe uma lista completa de medições individuais para construir uma série temporal. A navegação visual para Racks, Histórico e Relatórios também não representa, nesta versão, páginas completas com consultas independentes.
