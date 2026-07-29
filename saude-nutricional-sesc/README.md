# Saúde Nutricional

Fundação segura do piloto de saúde nutricional para duas unidades. O app
usa Next.js, Supabase Auth/PostgreSQL, Row Level Security e auditoria das
concessões temporárias entre unidades.

## Requisitos locais

- Node.js 24;
- pnpm 11.9.0 via Corepack;
- Docker em execução;
- portas `3000` e `54320`–`54329` disponíveis.

Instale as dependências e o navegador de teste com versões travadas:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
```

## Segurança dos dados e segredos

Use somente identidades e registros fictícios neste ambiente. Dados reais
de pacientes, anamneses, observações clínicas ou identificadores pessoais
reais são proibidos em seeds, testes, screenshots e logs.

Os arquivos `.env.local` e `.env.test.local` são ignorados pelo Git. Os
templates versionados contêm apenas nomes vazios. Nunca coloque a
`SUPABASE_SERVICE_ROLE_KEY` em código sob `src/`, em variáveis
`NEXT_PUBLIC_*`, no navegador, em screenshots ou em logs. A chave
service-role é usada somente pelo script Node local
`scripts/seed-local-users.mjs`.

## Inicialização local

Execute toda a sequência no mesmo terminal para manter os valores somente
no ambiente do processo:

```bash
pnpm exec supabase start
cp .env.example .env.local

eval "$(pnpm exec supabase status -o env)"
export NEXT_PUBLIC_SUPABASE_URL="$API_URL"
export NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="$PUBLISHABLE_KEY"
export SUPABASE_URL="$API_URL"
export SUPABASE_SERVICE_ROLE_KEY="$SERVICE_ROLE_KEY"
export E2E_COORDINATOR_PASSWORD="Local-only-Aa1-$(openssl rand -hex 16)"
export E2E_NUTRITIONIST_PASSWORD="Local-only-Bb2-$(openssl rand -hex 16)"

pnpm exec supabase db reset
pnpm seed:test-users
pnpm dev --hostname 127.0.0.1 --port 3000
```

O `eval` captura a saída `env` do Supabase sem imprimi-la. Não execute
`env`, `printenv` nem comandos de debug que despejem esses valores. O
`.env.local` criado acima deve permanecer sem a service-role; as variáveis
exportadas têm validade somente nessa sessão do terminal.

Abra [http://127.0.0.1:3000](http://127.0.0.1:3000). As contas locais são
`coordinator@example.test` e `nutritionist@example.test`, com as senhas
efêmeras exportadas na mesma sessão. O seed atualiza a senha de usuários
existentes e faz upsert dos perfis, portanto pode ser executado novamente
com segurança.

## Banco, reset e tipos

O seed SQL contém apenas as duas unidades fictícias e registros de
aplicação não clínicos. Usuários Auth são preparados separadamente depois
do reset:

```bash
pnpm exec supabase db reset
pnpm seed:test-users
```

Uma execução E2E concluída deixa a autorização criada no estado revogado e
pode ser repetida. Se um teste for interrompido depois de autorizar e antes
de revogar, restaure o estado com os dois comandos acima; não apague grants
ou auditoria manualmente.

Regere os tipos após qualquer alteração de schema:

```bash
pnpm exec supabase gen types typescript --local \
  > src/platform/types/database.ts
pnpm typecheck
```

## Testes e gates

Testes unitários e cobertura:

```bash
pnpm test
pnpm test:coverage
```

Testes e lint do banco local:

```bash
pnpm exec supabase db reset
pnpm test:db
pnpm exec supabase db lint --local --level warning --fail-on warning
```

O E2E requer as variáveis e usuários da seção de inicialização. O
Playwright inicia o Next.js em `127.0.0.1:3000` e executa Chromium:

```bash
pnpm seed:test-users
pnpm test:e2e
```

Matriz completa antes de revisão:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test:coverage
pnpm exec supabase db reset
pnpm test:db
pnpm exec supabase db lint --local --level warning --fail-on warning
pnpm seed:test-users
pnpm test:e2e
pnpm build
pnpm audit --prod --audit-level high
pnpm audit --audit-level high
git diff --check
```

A cobertura global mínima é 80%; as ramificações de autorização exigem
100%. O E2E cobre autorização e revogação pelo coordinator e a negação da
área de Configurações ao nutritionist.

## Solução de problemas

- `Missing environment variables`: volte à seção de inicialização e
  exporte os valores no mesmo terminal, sem imprimi-los.
- `email_provider_disabled`: reinicie o Supabase local para aplicar
  `supabase/config.toml`, depois execute reset e seed novamente.
- erro `42501` no seed: confirme que o banco está na migration atual com
  `pnpm exec supabase db reset`; não use credenciais de banco como atalho.
- grant ativo residual: use reset + seed em vez de editar tabelas ou
  auditoria diretamente.
- porta `3000` ocupada: encerre somente o servidor de desenvolvimento que
  você iniciou ou use o servidor existente do mesmo checkout.

Não cole chaves, senhas, URLs assinadas ou traces de autenticação em
issues, relatórios ou mensagens de suporte.

## Produção

Esta fundação local não é uma autorização para uso clínico. Qualquer
deploy, carga de dados ou acesso em produção depende de aprovação
institucional formal, avaliação de privacidade e segurança, definição de
base legal e controles LGPD, gestão de incidentes e validação dos
responsáveis técnicos.
