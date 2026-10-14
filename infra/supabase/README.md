# Banco de dados — MMGIA (Supabase self-hosted, Postgres)

Direção **ativa** do backend do MMGIA: Supabase self-hosted numa VPS própria
(ex. Hostinger), não Cloudflare Workers + D1/Turso. O schema SQLite original
(`../migrations/`, CLAUDE.md Fase 5) fica preservado como referência — ver a
nota no topo de `../README.md` — mas não recebe mais mudanças.

## Por que Supabase em vez do Worker + D1/Turso do CLAUDE.md original

- **Supabase Auth** substitui as tabelas `admin_users`/`admin_sessions`
  inteiras (e-mail, senha com hash, sessão, `last_sign_in_at`) — não
  reimplementamos nada disso, só o que é específico do produto
  (`admin_profiles`: nome, papel/RBAC, ativo).
- **PostgREST** (parte do stack Supabase) expõe uma API REST sobre o
  Postgres automaticamente, a partir do schema + RLS — não precisamos
  escrever rotas HTTP uma a uma como o Worker original previa.
- **Row Level Security** aplica o isolamento dos "dois mundos" (CLAUDE.md)
  dentro do próprio banco: mesmo um bug de aplicação não consegue, por
  exemplo, listar todas as `submissions` como anônimo — a ausência de uma
  policy de SELECT para `anon` bloqueia isso estruturalmente, não por
  convenção de código.
- Continua gratuito/baixíssimo custo: a VPS já paga substitui o free tier do
  Cloudflare Workers/D1, sem depender de nenhum serviço gerenciado pago.

## Os dois mundos, agora com RLS

`submissions` (público anônimo) e `admin_profiles`/`auth.users` (admin
identificado) não têm nenhuma FK entre si. Com RLS, isso vai além de "não
têm relação": por padrão **toda tabela com RLS ativo e sem policy bloqueia
tudo**, inclusive para quem é dono da linha. Cada policy em
`migrations/006_rls_policies.sql` é uma exceção mínima e explícita a essa
regra. Em particular:

- Não existe policy de `SELECT` para `anon` em `submissions` — se existisse,
  daria para listar/raspar todas as avaliações pela API pública, mesmo sem
  identidade, o que já seria uma violação de k-anonimidade ao cruzar colunas
  (UF + setor + porte + período já reduz bastante o conjunto). Em vez disso,
  três funções `security definer` expõem só o necessário:
  - `find_submission_by_code_hash(hash)` — tela "Editar com código", devolve
    no máximo 1 linha, pelo hash exato.
  - `update_submission_by_code_hash(...)` — idem, para salvar a edição.
  - `painel_aggregate(...)` — Painel Público; replica a mesma regra de
    sigilo `k >= 5` de `packages/shared/src/lib/observatory.ts` (`K_MIN`)
    dentro do SQL (`case when count(*) >= 5 then avg(...) end`), para que o
    sigilo valha mesmo que o código que chama a função tenha um bug.
- Acesso de admin é sempre por `current_admin_role()` (função `stable
  security definer` que lê `admin_profiles` pelo `auth.uid()` da sessão) —
  nunca checado na aplicação sozinha.

Tudo isso foi testado rodando as 6 migrations de ponta a ponta contra um
Postgres real (container Docker `postgres:16-alpine`, com um schema `auth`
mínimo simulando o que o Supabase provisiona), incluindo testes negativos:
`leitor` tentando dar UPDATE em `submissions` (bloqueado), `anon` tentando
`SELECT * FROM submissions` direto (bloqueado), colisão de `edit_code_hash`
(bloqueado pela UNIQUE), UF com só 1 registro no `painel_aggregate` voltando
`NULL` em vez do score. Ver `test/901_functional_tests.sql` (não faz parte
do deploy — é só o roteiro de validação, para rodar de novo se o schema
mudar).

## Migrations

Rodar em ordem, uma vez cada, nunca editar uma já aplicada:

| Arquivo | O que cria |
|---|---|
| `001_submissions.sql` | Tabela `submissions` |
| `002_edit_code.sql` | Código de edição (hash, nunca texto puro) |
| `003_admin_profiles.sql` | `admin_profiles` + trigger em `auth.users` + `current_admin_role()` |
| `004_news.sql` | `news_items` — curadoria de notícias (Fase B) |
| `005_legal.sql` | `legal_refs` — base legal das 45 práticas |
| `006_rls_policies.sql` | RLS de todas as tabelas + funções RPC (`find_submission_by_code_hash`, `update_submission_by_code_hash`, `painel_aggregate`) |

`003_admin_profiles.sql` depende de `auth.users`, que só existe numa
instância Supabase de verdade (hospedada ou self-hosted) — não roda em
Postgres puro. `test/000_stub_auth.sql` simula o mínimo disso só para testes
locais fora do Supabase; **nunca rodar esse arquivo contra a VPS real**.

---

## Guia de deploy na VPS (Hostinger)

### 1. Pré-requisitos na VPS

- Ubuntu 22.04+ (ou Debian equivalente), acesso root/sudo via SSH.
- Mínimo recomendado: 2 vCPU / 4 GB RAM / 40 GB disco (o stack completo do
  Supabase sobe ~10 containers: Postgres, GoTrue, PostgREST, Realtime,
  Storage, Kong, Studio, etc.). Em 1 vCPU/2 GB tende a sofrer sob carga.
- Um domínio (ou subdomínio) apontando para o IP da VPS, ex.
  `supabase.seudominio.com.br` — necessário para TLS automático no passo 5.
- Docker + Docker Compose instalados:

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker "$USER"
# saia e reconecte o SSH para o grupo "docker" valer
docker compose version   # confirma o plugin compose
```

### 2. Baixar o stack oficial do Supabase

```bash
git clone --depth 1 https://github.com/supabase/supabase
cd supabase/docker
cp .env.example .env
```

### 3. Gerar os segredos em `.env`

**Nunca usar os valores de exemplo do `.env.example` em produção.** Gerar
valores novos para cada um:

```bash
# POSTGRES_PASSWORD, DASHBOARD_PASSWORD: strings aleatórias fortes
openssl rand -base64 32

# JWT_SECRET: mínimo 32 caracteres
openssl rand -base64 32
```

Com o `JWT_SECRET` definido, gerar o par `ANON_KEY`/`SERVICE_ROLE_KEY`
correspondente (são JWTs assinados com esse secret, não strings aleatórias
soltas — usar o gerador oficial, por exemplo rodando-o localmente):
<https://supabase.com/docs/guides/self-hosting/docker#generate-api-keys>

Preencher no `.env` pelo menos:

```
POSTGRES_PASSWORD=<gerado acima>
JWT_SECRET=<gerado acima>
ANON_KEY=<gerado a partir do JWT_SECRET>
SERVICE_ROLE_KEY=<gerado a partir do JWT_SECRET>
DASHBOARD_USERNAME=<usuário do Studio>
DASHBOARD_PASSWORD=<gerado acima>
SITE_URL=https://supabase.seudominio.com.br
API_EXTERNAL_URL=https://supabase.seudominio.com.br
SUPABASE_PUBLIC_URL=https://supabase.seudominio.com.br
```

`SERVICE_ROLE_KEY` ignora RLS por completo — tratar como senha de root do
banco. Nunca colocar no frontend (`apps/web`/`apps/admin`); só em código que
roda no servidor (se um dia existir uma Edge Function/backend próprio além
do PostgREST). O `ANON_KEY` é o único que os dois apps devem usar.

### 4. Subir o stack

```bash
docker compose up -d
docker compose ps   # todos os serviços devem ficar "healthy"/"running"
```

Studio (painel administrativo do Supabase) fica disponível na porta 8000 do
Kong por padrão — ainda sem TLS/domínio nesse ponto, só acessível via
`http://<ip-da-vps>:8000` protegido pelo `DASHBOARD_USERNAME`/`PASSWORD`.

### 5. Reverse proxy + TLS (Caddy)

Hostinger não tem um edge gerenciado com SSL automático (como o Cloudflare
que o CLAUDE.md original assumia) — isso precisa ser configurado na própria
VPS. Caddy é o caminho mais simples (TLS automático via Let's Encrypt, sem
configuração manual de certificado):

```bash
sudo apt install -y caddy
```

`/etc/caddy/Caddyfile`:

```
supabase.seudominio.com.br {
  reverse_proxy localhost:8000
}
```

```bash
sudo systemctl reload caddy
```

A partir daqui, `https://supabase.seudominio.com.br` serve Kong (que roteia
internamente para Auth/PostgREST/Studio/Storage/Realtime pelo path).

### 6. Firewall

Expor publicamente só 80/443 (Caddy). Tudo mais — Postgres (5432), Kong
direto (8000), containers internos — só em `localhost`/rede interna do
Docker:

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

Confirmar que a porta 5432 do Postgres não está exposta a `0.0.0.0` (checar
o `docker-compose.yml` do stack — por padrão já é só `127.0.0.1:5432`, mas
vale confirmar antes de abrir o firewall).

### 7. Aplicar as migrations do MMGIA

Com o stack no ar, aplicar `001` a `006` nesta ordem contra o Postgres do
Supabase (porta publicada localmente pelo compose, tipicamente 5432 em
`127.0.0.1`, senha = `POSTGRES_PASSWORD` do `.env`):

```bash
cd /caminho/do/projeto/mmgia/infra/supabase/migrations
for f in 001_submissions.sql 002_edit_code.sql 003_admin_profiles.sql 004_news.sql 005_legal.sql 006_rls_policies.sql; do
  psql "postgresql://postgres:<POSTGRES_PASSWORD>@127.0.0.1:5432/postgres" -v ON_ERROR_STOP=1 -f "$f"
done
```

(Rodar via SSH tunnel ou direto na VPS — nunca expor a porta do Postgres à
internet para fazer isso remotamente.)

**Não rodar `test/000_stub_auth.sql` nem `test/901_functional_tests.sql`
aqui** — são só para testes locais fora do Supabase; `auth.users` e as
roles `anon`/`authenticated`/`service_role` já existem de verdade nesta
instância.

### 8. Criar os primeiros admins

Sem SQL direto (ver nota em `seeds/dev_seed.sql`) — pelo Studio
(`Authentication → Add user`, com e-mail confirmado) ou via API:

```bash
curl -X POST 'https://supabase.seudominio.com.br/auth/v1/admin/users' \
  -H "apikey: <SERVICE_ROLE_KEY>" \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"email":"seu-email@dominio.com.br","password":"troque-depois","email_confirm":true}'
```

O trigger (`003_admin_profiles.sql`) já cria o `admin_profile` com
`role='leitor'` automaticamente. Promover o primeiro usuário a
`super_admin` direto no banco (único passo que ainda precisa de SQL, porque
ninguém com permissão de promover existe ainda):

```sql
update public.admin_profiles set role = 'super_admin'
  where id = (select id from auth.users where email = 'seu-email@dominio.com.br');
```

Depois disso, promoções seguem pela tela "Usuários + Perfis" do admin
(CLAUDE.md, Tela 12) — quando ela estiver de fato ligada a este backend.

### 9. Seed de desenvolvimento (opcional, nunca em produção)

`seeds/dev_seed.sql` segue os mesmos passos 8 (criar os usuários de teste
antes) e depois promove os papéis + insere `legal_refs`/`news_items`/
`submissions` de exemplo. Ver o cabeçalho do arquivo.

### 10. Backups

Supabase self-hosted não faz backup automático por si só. No mínimo, um
`pg_dump` agendado (cron) salvando fora da VPS:

```bash
# /etc/cron.daily/mmgia-backup (exemplo)
docker exec supabase-db pg_dump -U postgres postgres | gzip > /backups/mmgia-$(date +%F).sql.gz
```

---

## O que ainda falta (fora do escopo deste schema)

- **Nenhum dos dois apps (`apps/web`, `apps/admin`) está ligado a este
  backend ainda** — hoje ambos operam 100% client-side, com os dados de
  exemplo embutidos em `packages/shared/src/types.ts` (`SEED_*`). Ligar o
  Onboarding/Avaliação ao `POST` de `submissions`, o Painel Público a
  `painel_aggregate`, e o admin a `admin_profiles`/CRUDs é o próximo passo,
  não implementado nesta mudança.
- Cliente JS: usar `@supabase/supabase-js` nos dois apps, apontando para
  `SUPABASE_PUBLIC_URL` + `ANON_KEY` (nunca a `SERVICE_ROLE_KEY` no
  frontend).
- Migração dos dados hoje só em `localStorage` (avaliações feitas antes de
  existir backend) — não há dado real para migrar ainda.

## Mapeamento banco ↔ frontend

Mesmo mapeamento documentado em `../README.md` (`AssessmentMetadata`,
`HistoricalRecord`, `regiao`/`poder` derivados no servidor, `periodo`
derivado de `created_at` na camada de API, as 45 práticas fixas em código).
