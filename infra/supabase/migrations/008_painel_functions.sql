-- 008_painel_functions.sql (Postgres / Supabase)
-- O Painel Público (apps/web/src/components/PublicPanel.tsx) precisa de bem
-- mais do que o painel_aggregate de 006: mapa com as 27 UFs de uma vez,
-- evolução mensal, comparativos por setor/porte/esfera/área/relação com IA, e
-- a lista de "quais opções de filtro ficariam com menos de 5 avaliações" (pra
-- desabilitar no dropdown). Até aqui o front calculava tudo isso no navegador
-- em cima de HistoricalRecord[] (packages/shared/src/lib/observatory.ts) — as
-- 5 funções abaixo replicam exatamente essa semântica (mesmo K_MIN=5, mesma
-- regra de "nunca listar nenhum estado/mês/grupo com <5 sem mascarar a
-- média"), só que calculadas no banco sobre `submissions` de verdade, nunca
-- devolvendo registro por registro — cada linha devolvida já é uma agregação.
--
-- Todas security definer (mesmo motivo de painel_aggregate em 006: não existe
-- policy de SELECT para anon em submissions) e concedidas a anon.

-- ===== painel_byuf — mapa por estado (sempre as 27 UFs, mesmo com n=0) =====
create function public.painel_byuf(
  p_setor text default null, p_esfera text default null, p_area text default null,
  p_poder text default null, p_relacao_ia text default null, p_porte text default null
)
returns table (
  estado text, n bigint,
  score_global double precision, score_gov double precision, score_tec double precision,
  score_seg double precision, score_edu double precision, score_eco double precision
)
language sql
stable
security definer
set search_path = public
as $$
  with ufs(estado) as (
    values ('AC'),('AL'),('AP'),('AM'),('BA'),('CE'),('DF'),('ES'),('GO'),
           ('MA'),('MT'),('MS'),('MG'),('PA'),('PB'),('PR'),('PE'),('PI'),
           ('RJ'),('RN'),('RS'),('RO'),('RR'),('SC'),('SP'),('SE'),('TO')
  ),
  filtrado as (
    select * from public.submissions
    where (p_setor is null or setor = p_setor)
      and (p_esfera is null or esfera = p_esfera)
      and (p_area is null or area = p_area)
      and (p_poder is null or poder = p_poder)
      and (p_relacao_ia is null or relacao_ia = p_relacao_ia)
      and (p_porte is null or porte = p_porte)
  ),
  agregado as (
    select estado, count(*) as n,
      avg(score_global) as score_global, avg(score_gov) as score_gov, avg(score_tec) as score_tec,
      avg(score_seg) as score_seg, avg(score_edu) as score_edu, avg(score_eco) as score_eco
    from filtrado group by estado
  )
  select
    ufs.estado,
    coalesce(agregado.n, 0) as n,
    case when agregado.n >= 5 then agregado.score_global end,
    case when agregado.n >= 5 then agregado.score_gov end,
    case when agregado.n >= 5 then agregado.score_tec end,
    case when agregado.n >= 5 then agregado.score_seg end,
    case when agregado.n >= 5 then agregado.score_edu end,
    case when agregado.n >= 5 then agregado.score_eco end
  from ufs left join agregado using (estado);
$$;
grant execute on function public.painel_byuf(text, text, text, text, text, text) to anon;

-- ===== painel_byregion — mesma coisa, agrupado pelas 5 regiões =====
create function public.painel_byregion(
  p_setor text default null, p_esfera text default null, p_area text default null,
  p_poder text default null, p_relacao_ia text default null, p_porte text default null
)
returns table (
  regiao text, n bigint,
  score_global double precision, score_gov double precision, score_tec double precision,
  score_seg double precision, score_edu double precision, score_eco double precision
)
language sql
stable
security definer
set search_path = public
as $$
  with regioes(regiao) as (
    values ('Norte'), ('Nordeste'), ('Centro-Oeste'), ('Sudeste'), ('Sul')
  ),
  filtrado as (
    select * from public.submissions
    where (p_setor is null or setor = p_setor)
      and (p_esfera is null or esfera = p_esfera)
      and (p_area is null or area = p_area)
      and (p_poder is null or poder = p_poder)
      and (p_relacao_ia is null or relacao_ia = p_relacao_ia)
      and (p_porte is null or porte = p_porte)
  ),
  agregado as (
    select regiao, count(*) as n,
      avg(score_global) as score_global, avg(score_gov) as score_gov, avg(score_tec) as score_tec,
      avg(score_seg) as score_seg, avg(score_edu) as score_edu, avg(score_eco) as score_eco
    from filtrado group by regiao
  )
  select
    regioes.regiao,
    coalesce(agregado.n, 0) as n,
    case when agregado.n >= 5 then agregado.score_global end,
    case when agregado.n >= 5 then agregado.score_gov end,
    case when agregado.n >= 5 then agregado.score_tec end,
    case when agregado.n >= 5 then agregado.score_seg end,
    case when agregado.n >= 5 then agregado.score_edu end,
    case when agregado.n >= 5 then agregado.score_eco end
  from regioes left join agregado using (regiao);
$$;
grant execute on function public.painel_byregion(text, text, text, text, text, text) to anon;

-- ===== painel_monthly — série dos últimos N meses (padrão 12), terminando no
-- mês mais recente presente no recorte filtrado (não "hoje") =====
create function public.painel_monthly(
  p_setor text default null, p_esfera text default null, p_area text default null,
  p_poder text default null, p_relacao_ia text default null, p_porte text default null,
  p_uf text default null, p_months integer default 12
)
returns table (ano integer, mes integer, n bigint, score_global double precision)
language sql
stable
security definer
set search_path = public
as $$
  with filtrado as (
    select * from public.submissions
    where (p_setor is null or setor = p_setor)
      and (p_esfera is null or esfera = p_esfera)
      and (p_area is null or area = p_area)
      and (p_poder is null or poder = p_poder)
      and (p_relacao_ia is null or relacao_ia = p_relacao_ia)
      and (p_porte is null or porte = p_porte)
      and (p_uf is null or estado = p_uf)
  ),
  ultimo as (select max(date_trunc('month', created_at)) as m from filtrado),
  meses as (
    select generate_series(
      (select m from ultimo) - ((p_months - 1) || ' months')::interval,
      (select m from ultimo),
      '1 month'::interval
    ) as mes_ini
    where (select m from ultimo) is not null
  ),
  agregado as (
    select date_trunc('month', created_at) as mes_ini, count(*) as n, avg(score_global) as score_global
    from filtrado group by date_trunc('month', created_at)
  )
  select
    extract(year from meses.mes_ini)::int,
    extract(month from meses.mes_ini)::int,
    coalesce(agregado.n, 0),
    case when agregado.n >= 5 then agregado.score_global end
  from meses left join agregado using (mes_ini)
  order by meses.mes_ini;
$$;
grant execute on function public.painel_monthly(text, text, text, text, text, text, text, integer) to anon;

-- ===== painel_compareby — uma linha por valor distinto de um campo (setor,
-- esfera, area, porte, poder ou relacao_ia), cada uma com seu próprio k>=5 =====
create function public.painel_compareby(
  p_setor text default null, p_esfera text default null, p_area text default null,
  p_poder text default null, p_relacao_ia text default null, p_porte text default null,
  p_uf text default null, p_group_by text default 'setor'
)
returns table (
  grupo text, n bigint,
  score_global double precision, score_gov double precision, score_tec double precision,
  score_seg double precision, score_edu double precision, score_eco double precision
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if p_group_by not in ('setor', 'esfera', 'area', 'porte', 'poder', 'relacao_ia') then
    raise exception 'campo de agrupamento inválido: %', p_group_by;
  end if;

  return query execute format(
    $q$
    select %1$I as grupo, count(*) as n,
      case when count(*) >= 5 then avg(score_global) end,
      case when count(*) >= 5 then avg(score_gov) end,
      case when count(*) >= 5 then avg(score_tec) end,
      case when count(*) >= 5 then avg(score_seg) end,
      case when count(*) >= 5 then avg(score_edu) end,
      case when count(*) >= 5 then avg(score_eco) end
    from public.submissions
    where %1$I is not null
      and ($1 is null or setor = $1)
      and ($2 is null or esfera = $2)
      and ($3 is null or area = $3)
      and ($4 is null or poder = $4)
      and ($5 is null or relacao_ia = $5)
      and ($6 is null or porte = $6)
      and ($7 is null or estado = $7)
    group by %1$I
    $q$,
    p_group_by
  ) using p_setor, p_esfera, p_area, p_poder, p_relacao_ia, p_porte, p_uf;
end;
$$;
grant execute on function public.painel_compareby(text, text, text, text, text, text, text, text) to anon;

-- ===== painel_level_distribution — % de avaliações em cada nível (0-5) do
-- recorte filtrado; vazio (0 linhas) se o recorte inteiro tiver menos de 5 =====
create function public.painel_level_distribution(
  p_setor text default null, p_esfera text default null, p_area text default null,
  p_poder text default null, p_relacao_ia text default null, p_porte text default null,
  p_uf text default null
)
returns table (nivel integer, pct double precision)
language sql
stable
security definer
set search_path = public
as $$
  with filtrado as (
    select
      case
        when score_global < 0.5 then 0
        when score_global < 1.0 then 1
        when score_global < 1.5 then 2
        when score_global < 2.0 then 3
        when score_global < 2.5 then 4
        else 5
      end as nivel
    from public.submissions
    where (p_setor is null or setor = p_setor)
      and (p_esfera is null or esfera = p_esfera)
      and (p_area is null or area = p_area)
      and (p_poder is null or poder = p_poder)
      and (p_relacao_ia is null or relacao_ia = p_relacao_ia)
      and (p_porte is null or porte = p_porte)
      and (p_uf is null or estado = p_uf)
  ),
  totais as (select count(*) as total from filtrado)
  select f.nivel, (count(*)::double precision / t.total) * 100
  from filtrado f, totais t
  where t.total >= 5
  group by f.nivel, t.total;
$$;
grant execute on function public.painel_level_distribution(text, text, text, text, text, text, text) to anon;

-- ===== painel_filter_counts — contagem por valor de cada campo de filtro,
-- aplicando sempre os OUTROS filtros ativos (nunca o próprio campo) — é
-- exatamente o que PublicPanel.tsx usa pra desabilitar uma opção do dropdown
-- que deixaria o recorte com menos de 5 avaliações (wouldBreakK). Um único
-- round-trip em vez de 6 (um por campo de filtro). =====
create function public.painel_filter_counts(
  p_setor text default null, p_esfera text default null, p_area text default null,
  p_poder text default null, p_relacao_ia text default null, p_porte text default null
)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'setor', (
      select coalesce(jsonb_object_agg(setor, cnt), '{}'::jsonb) from (
        select setor, count(*) as cnt from public.submissions
        where (p_esfera is null or esfera = p_esfera) and (p_area is null or area = p_area)
          and (p_poder is null or poder = p_poder) and (p_relacao_ia is null or relacao_ia = p_relacao_ia)
          and (p_porte is null or porte = p_porte)
        group by setor
      ) t
    ),
    'esfera', (
      select coalesce(jsonb_object_agg(esfera, cnt), '{}'::jsonb) from (
        select esfera, count(*) as cnt from public.submissions
        where esfera is not null and (p_setor is null or setor = p_setor) and (p_area is null or area = p_area)
          and (p_poder is null or poder = p_poder) and (p_relacao_ia is null or relacao_ia = p_relacao_ia)
          and (p_porte is null or porte = p_porte)
        group by esfera
      ) t
    ),
    'area', (
      select coalesce(jsonb_object_agg(area, cnt), '{}'::jsonb) from (
        select area, count(*) as cnt from public.submissions
        where area is not null and (p_setor is null or setor = p_setor) and (p_esfera is null or esfera = p_esfera)
          and (p_poder is null or poder = p_poder) and (p_relacao_ia is null or relacao_ia = p_relacao_ia)
          and (p_porte is null or porte = p_porte)
        group by area
      ) t
    ),
    'poder', (
      select coalesce(jsonb_object_agg(poder, cnt), '{}'::jsonb) from (
        select poder, count(*) as cnt from public.submissions
        where poder is not null and (p_setor is null or setor = p_setor) and (p_esfera is null or esfera = p_esfera)
          and (p_area is null or area = p_area) and (p_relacao_ia is null or relacao_ia = p_relacao_ia)
          and (p_porte is null or porte = p_porte)
        group by poder
      ) t
    ),
    'relacao_ia', (
      select coalesce(jsonb_object_agg(relacao_ia, cnt), '{}'::jsonb) from (
        select relacao_ia, count(*) as cnt from public.submissions
        where relacao_ia is not null and (p_setor is null or setor = p_setor) and (p_esfera is null or esfera = p_esfera)
          and (p_area is null or area = p_area) and (p_poder is null or poder = p_poder)
          and (p_porte is null or porte = p_porte)
        group by relacao_ia
      ) t
    ),
    'porte', (
      select coalesce(jsonb_object_agg(porte, cnt), '{}'::jsonb) from (
        select porte, count(*) as cnt from public.submissions
        where (p_setor is null or setor = p_setor) and (p_esfera is null or esfera = p_esfera)
          and (p_area is null or area = p_area) and (p_poder is null or poder = p_poder)
          and (p_relacao_ia is null or relacao_ia = p_relacao_ia)
        group by porte
      ) t
    )
  );
$$;
grant execute on function public.painel_filter_counts(text, text, text, text, text, text) to anon;
