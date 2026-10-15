/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { supabase } from './supabase';
import { derivarPoder, derivarRegiao } from './taxonomy';
import { LIST_PRACTICES, type DimensionId, type HistoricalRecord, type NewsItem } from '../types';
import type { Area, AreaPrivada, Esfera, Setor } from './taxonomy';

export interface AdminProfile {
  id: string;
  nome: string;
  email: string;
  role: 'super_admin' | 'gestor' | 'leitor';
  ativo: boolean;
}

/**
 * Login real via Supabase Auth. Sucesso na autenticação não basta: a conta
 * também precisa ter um admin_profile ativo (ver infra/supabase/migrations/003_admin_profiles.sql
 * — toda conta nova nasce 'leitor', mas pode estar desativada). Sem isso,
 * desloga de novo e devolve erro — não deixa uma sessão "zumbi" sem papel.
 */
export async function signInAdmin(
  email: string,
  password: string
): Promise<{ ok: true; profile: AdminProfile } | { ok: false; error: string }> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return { ok: false, error: 'E-mail ou senha incorretos.' };

  const profile = await fetchOwnProfile();
  if (!profile || !profile.ativo) {
    await supabase.auth.signOut();
    return { ok: false, error: 'Esta conta não tem acesso ativo ao painel administrativo.' };
  }
  return { ok: true, profile };
}

export async function signOutAdmin(): Promise<void> {
  await supabase.auth.signOut();
}

export async function requestAdminPasswordReset(email: string): Promise<boolean> {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  return !error;
}

/** Restaura a sessão ao recarregar a página — sem isso, todo F5 forçaria um novo login. */
export async function restoreAdminSession(): Promise<AdminProfile | null> {
  const { data } = await supabase.auth.getSession();
  if (!data.session) return null;
  const profile = await fetchOwnProfile();
  if (!profile || !profile.ativo) return null;
  return profile;
}

async function fetchOwnProfile(): Promise<AdminProfile | null> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;
  const { data, error } = await supabase
    .from('admin_profiles')
    .select('id, nome, email, role, ativo')
    .eq('id', userData.user.id)
    .maybeSingle();
  if (error || !data) return null;
  return data as AdminProfile;
}

// ===== submissions (Gestão de dados / Mapa nacional / Dados abertos) =====

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

interface SubmissionDbRow {
  id: string;
  setor: string;
  esfera: string | null;
  area: string | null;
  atividade_estatal: string | null;
  relacao_ia: string | null;
  estado: string;
  porte: string;
  regiao: string | null;
  poder: string | null;
  revisar: boolean;
  score_global: number;
  score_gov: number;
  score_tec: number;
  score_seg: number;
  score_edu: number;
  score_eco: number;
  created_at: string;
}

function rowToHistoricalRecord(row: SubmissionDbRow): HistoricalRecord {
  const created = new Date(row.created_at);
  return {
    id: row.id,
    periodo: `${MESES[created.getMonth()]}/${created.getFullYear()}`,
    taxonomiaVersao: 2,
    setor: row.setor as Setor,
    esfera: (row.esfera ?? undefined) as Esfera | undefined,
    area: (row.area ?? undefined) as Area | undefined,
    atividadeEstatal: (row.atividade_estatal ?? undefined) as AreaPrivada | undefined,
    relacaoIA: (row.relacao_ia ?? undefined) as HistoricalRecord['relacaoIA'],
    revisar: row.revisar,
    poder: (row.poder ?? undefined) as HistoricalRecord['poder'],
    regiao: (row.regiao ?? derivarRegiao(row.estado) ?? 'Sudeste') as HistoricalRecord['regiao'],
    estado: row.estado,
    porte: row.porte,
    score_global: row.score_global,
    score_gov: row.score_gov,
    score_tec: row.score_tec,
    score_seg: row.score_seg,
    score_edu: row.score_edu,
    score_eco: row.score_eco,
  };
}

export async function fetchSubmissions(): Promise<HistoricalRecord[]> {
  const { data, error } = await supabase
    .from('submissions')
    .select('id, setor, esfera, area, atividade_estatal, relacao_ia, estado, porte, regiao, poder, revisar, score_global, score_gov, score_tec, score_seg, score_edu, score_eco, created_at')
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return (data as SubmissionDbRow[]).map(rowToHistoricalRecord);
}

export async function deleteSubmission(id: string): Promise<boolean> {
  const { error } = await supabase.from('submissions').delete().eq('id', id);
  return !error;
}

export interface ReclassifyPatch {
  setor: Setor;
  esfera?: Esfera;
  area?: Area;
  atividadeEstatal?: AreaPrivada;
}

/** Reclassificação: reconstrói regiao/poder com as mesmas funções usadas no cliente público, nunca reimplementa a derivação. */
export async function reclassifySubmission(id: string, estado: string, patch: ReclassifyPatch): Promise<boolean> {
  const { error } = await supabase
    .from('submissions')
    .update({
      setor: patch.setor,
      esfera: patch.setor === 'publico' ? (patch.esfera ?? null) : null,
      area: patch.area ?? null,
      atividade_estatal: patch.area === 'estatal' ? (patch.atividadeEstatal ?? null) : null,
      poder: derivarPoder(patch.setor, patch.area) ?? null,
      regiao: derivarRegiao(estado) ?? null,
      revisar: false,
    })
    .eq('id', id);
  return !error;
}

// ===== legal_refs (Base legal) =====

export interface LegalRefRow {
  id: string;
  practice_id: string;
  norma: string;
  artigo: string;
  descricao: string;
  url: string | null;
}

export async function fetchLegalRefs(): Promise<LegalRefRow[]> {
  const { data, error } = await supabase.from('legal_refs').select('id, practice_id, norma, artigo, descricao, url').order('practice_id');
  if (error || !data) return [];
  return data as LegalRefRow[];
}

export function practiceDimension(practiceId: string): DimensionId | null {
  return LIST_PRACTICES.find((p) => p.id === practiceId)?.dimensionId ?? null;
}

export async function createLegalRef(input: { practiceId: string; norma: string; artigo: string; descricao: string }): Promise<boolean> {
  const { error } = await supabase.from('legal_refs').insert({
    practice_id: input.practiceId,
    norma: input.norma,
    artigo: input.artigo,
    descricao: input.descricao,
  });
  return !error;
}

export async function deleteLegalRef(id: string): Promise<boolean> {
  const { error } = await supabase.from('legal_refs').delete().eq('id', id);
  return !error;
}

// ===== news_items (Curadoria de notícias) =====

interface NewsDbRow {
  id: string;
  titulo: string;
  resumo: string;
  fonte: string;
  url: string;
  categoria: string | null;
  status: 'pendente' | 'aprovada' | 'rejeitada' | 'destaque';
  publicado_em: string | null;
  created_at: string;
}

function rowToNewsItem(row: NewsDbRow): NewsItem {
  return {
    id: row.id,
    title: row.titulo,
    excerpt: row.resumo,
    category: (row.categoria ?? 'tecnologia') as NewsItem['category'],
    source: row.fonte,
    date: (row.publicado_em ?? row.created_at).slice(0, 10),
    featured: row.status === 'destaque',
  };
}

/** Lê pendentes + aprovadas + destaque (curadoria vê tudo que ainda não foi rejeitado). */
export async function fetchNewsItems(): Promise<NewsItem[]> {
  const { data, error } = await supabase
    .from('news_items')
    .select('id, titulo, resumo, fonte, url, categoria, status, publicado_em, created_at')
    .neq('status', 'rejeitada')
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return (data as NewsDbRow[]).map(rowToNewsItem);
}

export async function setNewsFeatured(id: string, featured: boolean): Promise<boolean> {
  const { error } = await supabase.from('news_items').update({ status: featured ? 'destaque' : 'aprovada' }).eq('id', id);
  return !error;
}

/** "Descartar" na fila de curadoria marca como rejeitada — nunca apaga a linha (mantém o histórico de curadoria). */
export async function rejectNewsItem(id: string): Promise<boolean> {
  const { error } = await supabase.from('news_items').update({ status: 'rejeitada' }).eq('id', id);
  return !error;
}

// ===== admin_profiles (Gestão de usuários — só super_admin, por RLS) =====

export async function fetchAdminProfiles(): Promise<AdminProfile[]> {
  const { data, error } = await supabase.from('admin_profiles').select('id, nome, email, role, ativo').order('nome');
  if (error || !data) return [];
  return data as AdminProfile[];
}

export async function setAdminProfileActive(id: string, ativo: boolean): Promise<boolean> {
  const { error } = await supabase.from('admin_profiles').update({ ativo }).eq('id', id);
  return !error;
}

export async function setAdminProfileRole(id: string, role: AdminProfile['role']): Promise<boolean> {
  const { error } = await supabase.from('admin_profiles').update({ role }).eq('id', id);
  return !error;
}
