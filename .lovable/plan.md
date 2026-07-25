Vamos construir um app minimalista de avaliação nutricional focado em nutricionistas gerenciarem pacientes e acompanhar diários alimentares.

## Escopo definido
- Público: profissionais da nutrição.
- Funcionalidade inicial: diário alimentar com cálculo de calorias e macronutrientes.
- Backend: Lovable Cloud (login + banco de dados).
- Estilo: minimalista, clean, sem modo escuro/claro como prioridade.
- Defaults escolhidos: perfis com nome/avatar, tabela de alimentos comuns + personalizados, nutricionista cria e gerencia pacientes.

## Estrutura de dados
1. `profiles` — perfis vinculados a `auth.users`, com nome, avatar, role (`nutritionist` ou `patient`).
2. `patients` — vínculo nutricionista-paciente, com metas calóricas e observações.
3. `foods` — alimentos base (comuns do app) e personalizados criados pelo nutricionista.
4. `meals` — refeições do dia (café da manhã, almoço, etc.) vinculadas a um paciente e data.
5. `meal_items` — itens dentro de cada refeição, com quantidade e cálculo proporcional de macros.

## Autenticação
- Email/senha + Google OAuth (padrão do Lovable Cloud).
- Rota `/auth` para login/cadastro.
- Layout protegido `_authenticated/` para área logada.
- Rota pública `/` como landing page com CTA para login.

## Telas principais
- `/` — landing minimalista.
- `/auth` — login e cadastro.
- `/dashboard` — resumo do dia (paciente) ou lista de pacientes (nutricionista).
- `/patients` — lista de pacientes (nutricionista).
- `/patients/$id` — ficha do paciente com diário alimentar e metas.
- `/foods` — gerenciamento de alimentos (nutricionista).

## Design
- Paleta minimalista com tons de verde suave (saúde/nutrição), superfícies claras e tipografia clean.
- Cards leves, espaçamento generoso, sem cores forçadas.
- Tokens semânticos no `src/styles.css`.

## Implementação
1. Configurar Google OAuth no Lovable Cloud.
2. Criar migrations com tabelas, GRANTs, RLS e policies.
3. Criar server functions para CRUD de pacientes, alimentos, refeições e itens.
4. Criar componentes reutilizáveis (Header, PatientCard, FoodSelector, MealCard, MacroSummary).
5. Criar rotas e layouts.
6. Ajustar metadados SEO de cada rota.
7. Verificar build e preview.