# Roteiro de implementação do Saúde Nutricional Sesc

**Especificação de origem:** `docs/superpowers/specs/2026-07-28-clinica-nutricional-sesc-design.md`

## Estratégia

O piloto será construído como um monólito modular: uma aplicação web, um banco PostgreSQL central e módulos de negócio com fronteiras explícitas. A decomposição abaixo evita que regras clínicas de maior risco, documentos e relatórios sejam implementados antes de autenticação, isolamento entre unidades e imutabilidade do histórico.

Cada incremento termina com software executável, testes automatizados e um commit revisável. Depois que o incremento 01 congelar os contratos do primeiro fluxo clínico, os incrementos 02, 03, 04, 05 e 07 poderão avançar em paralelo.

## Stack definida para o piloto

- Next.js 16.2.9 com App Router e TypeScript.
- React e Tailwind CSS para a interface institucional aprovada.
- Supabase Auth e PostgreSQL com Row Level Security.
- Zod para validação nas fronteiras.
- Vitest e Testing Library para testes unitários e de componentes.
- pgTAP via Supabase CLI para políticas e funções de banco.
- Playwright para fluxos de ponta a ponta.
- Recharts para gráficos.
- React PDF para documentos clínicos.
- ExcelJS para importações e exportações.
- pnpm 11 e Node.js 24.
- Sites para hospedagem do piloto, reutilizando `.openai/hosting.json` quando ele existir.

## Contratos globais

- O código do app ficará isolado em `saude-nutricional-sesc/`.
- `unit_id` será obrigatório em todo registro operacional ou clínico relevante.
- Toda leitura e escrita autenticada passará por um contexto de acesso verificado no servidor.
- A Row Level Security será a segunda barreira de isolamento; a interface nunca será a única proteção.
- Autorizações entre unidades guardarão concedente, motivo, início, validade e revogação.
- O perfil atual do paciente será separado dos snapshots clínicos preservados em consultas.
- Consultas terão os estados `draft` e `finalized`.
- Conteúdo finalizado será imutável; correções ocorrerão por complemento identificado.
- Regras clínicas serão funções puras identificadas por código, versão e fonte.
- Autosave usará revisão otimista e chave de idempotência.
- Auditoria não armazenará respostas de anamnese, observações ou outro texto clínico.
- Documentos serão gerados depois da persistência clínica e nunca dentro da mesma transação.
- Relatórios usarão projeções permitidas e não terão acesso genérico a anotações clínicas.
- Nenhuma credencial ou chave de serviço poderá chegar ao navegador ou ao repositório.
- Cobertura automatizada global mínima de 80%; autorização e regras clínicas exigirão cobertura integral dos ramos críticos.
- Dados reais só poderão entrar no ambiente de produção depois da validação institucional de privacidade, retenção, backup e recuperação.

## Incrementos

| Ordem | Plano | Entrega verificável | Dependências |
|---|---|---|---|
| 00 | Fundação segura | App iniciado, testes, autenticação, funções, unidades, autorização cruzada, RLS e auditoria | Nenhuma |
| 01 | Primeiro atendimento clínico | Paciente adulto → agenda → rascunho → peso/altura/IMC → finalização → histórico | 00 |
| 02 | Cadastro e importação | Cadastro completo, busca, duplicidade, staging da planilha, prévia e confirmação atômica | 01 e planilha-modelo |
| 03 | Agenda completa | Visões diária, semanal e mensal, estados, filtros e prevenção de sobreposição | 01 |
| 04 | Anamnese versionada | Editor do coordenador, sete tipos de campo, publicação de versões e snapshot na consulta | 01 |
| 05 | Antropometria configurável | Catálogo de medidas, unidades, valores improváveis, justificativa e regras de adulto e idoso | 01 e protocolo clínico validado |
| 06 | Regras pediátricas e gestacionais | OMS 0–5, OMS 5–19 e gestação com datasets versionados e casos dourados | 05 e validação clínica formal |
| 07 | Prescrição e documentos | Plano alimentar, modelos, receitas, exames, versões e PDFs reprocessáveis | 01 |
| 08 | Acompanhamento longitudinal | Linha do tempo completa, comparação entre consultas e gráficos por período | 04, 05, 06 e 07 |
| 09 | Painel e exportações | Indicadores consolidados, filtros, PDF/Excel e auditoria das emissões | 02, 03, 05 e 06 |
| 10 | Prontidão do piloto | Recuperação, expiração, logs protegidos, backup/restauração, acessibilidade, desempenho, segurança e E2E final | Todos |

## Matriz de cobertura da especificação

| Seção da especificação | Incrementos responsáveis |
|---|---|
| Usuários, funções, unidades e autorização | 00 e 10 |
| Navegação e identidade institucional | 00 e 01 |
| Cadastro direto de pacientes | 01 e 02 |
| Importação e duplicidade | 02 |
| Agenda | 01 e 03 |
| Anamnese configurável e versionada | 04 |
| Antropometria configurável | 05 |
| Crianças, adolescentes e gestantes | 06 |
| Consulta, rascunho, finalização e complementos | 01, 04 e 08 |
| Linha do tempo e gráficos | 01 e 08 |
| Plano alimentar, receitas, exames e PDFs | 07 |
| Painel, filtros, PDF e Excel | 09 |
| Privacidade, segurança, backup e auditoria | 00 e 10 |
| Erros, idempotência e recuperação | 00, 01, 02, 07 e 10 |
| Cobertura automatizada mínima de 80% | Todos |

## Critérios de saída por incremento

### 00 — Fundação segura

- Coordenador e nutricionista entram por convite, sem cadastro público.
- Cada perfil possui uma unidade principal.
- Nutricionista sem autorização não lê nem grava dados da outra unidade.
- Coordenador concede e revoga acesso cruzado com motivo e validade.
- Operações de acesso ficam auditadas sem conteúdo clínico.

### 01 — Primeiro atendimento clínico

- Nutricionista cadastra paciente adulto.
- Agenda consulta sem conflito.
- Inicia rascunho pela agenda.
- Registra motivo, observações, peso e altura.
- O sistema calcula IMC com regra e versão visíveis.
- Autosave repetido não duplica dados.
- Finalização é atômica e impede sobrescrita posterior.
- Consulta aparece como somente leitura na linha do tempo.

### 02 — Cadastro e importação

- Campos institucionais aprovados são cadastrados.
- Duplicidades são sinalizadas antes da criação.
- A planilha é validada em staging.
- Nenhuma linha é gravada antes da confirmação.
- A confirmação grava todas as linhas válidas ou nenhuma.

### 03 — Agenda completa

- Visualizações diária, semanal e mensal operam no fuso `America/Belem`.
- Estados de consulta seguem transições permitidas.
- Conflitos de profissional são impedidos no banco.
- Filtros respeitam unidade e autorização.

### 04 — Anamnese versionada

- Coordenador cria, ordena, ativa e desativa perguntas.
- Os sete tipos de campo da especificação funcionam.
- Publicação cria uma nova versão imutável.
- Consulta preserva o snapshot da versão respondida.

### 05 — Antropometria configurável

- Coordenador escolhe medidas por público.
- Cada observação preserva valor, unidade, método, data e autor.
- Valores improváveis exigem confirmação e justificativa.
- Adultos e idosos usam regras distintas e versionadas.

### 06 — Regras pediátricas e gestacionais

- Datasets oficiais possuem fonte, versão e hash.
- Sexo, idade exata e semana gestacional são considerados quando aplicável.
- Casos dourados são aprovados por nutricionista habilitado.
- Nenhuma classificação é liberada sem teste automatizado correspondente.

### 07 — Prescrição e documentos

- Planos possuem refeições, horários, quantidades e substituições.
- Versões anteriores permanecem disponíveis.
- Receitas e solicitações usam modelos editáveis.
- PDFs incluem unidade, paciente, profissional, data e assinatura.
- Falha de PDF não altera a consulta.

### 08 — Acompanhamento longitudinal

- Linha do tempo reúne consultas, complementos, prescrições e documentos.
- Gráficos permitem escolher indicador e período.
- Comparações usam snapshots e regras da época de cada consulta.

### 09 — Painel e exportações

- Coordenador filtra por período, unidade, profissional e público.
- Relatórios não contêm anotações clínicas.
- PDF e Excel reproduzem os totais exibidos.
- Cada exportação fica auditada.

### 10 — Prontidão do piloto

- Fluxos críticos passam em computador e tablet.
- Auditoria de segurança não possui achados críticos ou altos.
- Restauração de backup é executada e documentada.
- Métricas de desempenho atendem ao orçamento definido para o piloto.
- A equipe institucional aprova privacidade, retenção e entrada de dados reais.

## Ordem de planejamento detalhado

Os planos 00 e 01 são detalhados junto com este roteiro. Os planos 02 a 10 serão detalhados no fim do incremento anterior ou quando suas dependências estiverem congeladas. Essa decisão evita planos baseados em schemas ainda sujeitos a mudanças e mantém interfaces e nomes consistentes com o código real.
