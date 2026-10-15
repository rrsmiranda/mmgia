/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { supabase } from './supabase';
import { getAllDimensionScores, getGlobalScore } from './scoring';
import { derivarPoder, derivarRegiao } from './taxonomy';
import type { AssessmentMetadata, ScoreLevel } from '../types';

/**
 * Código de avaliação: gerado e mantido só no cliente. O banco nunca recebe
 * o texto puro — só o hash (ver infra/supabase/migrations/002_edit_code.sql).
 * Por isso um INSERT/RPC bem-sucedido nunca devolve o id/created_at gerados
 * pelo banco: não precisamos deles, e pedi-los de volta (RETURNING) exigiria
 * uma policy de SELECT para `anon` que não existe de propósito (ver
 * infra/supabase/README.md, seção "Prefer: return=minimal").
 */
async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function buildRow(answers: Record<string, ScoreLevel>, metadata: AssessmentMetadata) {
  const dims = getAllDimensionScores(answers);
  return {
    taxonomia_versao: metadata.taxonomiaVersao,
    setor: metadata.setor,
    esfera: metadata.esfera ?? null,
    area: metadata.area ?? null,
    atividade_estatal: metadata.atividadeEstatal ?? null,
    relacao_ia: metadata.relacaoIA ?? null,
    estado: metadata.estado,
    porte: metadata.porte,
    termos_aceitos: metadata.termosAceitos,
    regiao: derivarRegiao(metadata.estado) ?? null,
    poder: derivarPoder(metadata.setor, metadata.area) ?? null,
    respostas: answers,
    score_global: getGlobalScore(answers),
    score_gov: dims.gov,
    score_tec: dims.tec,
    score_seg: dims.seg,
    score_edu: dims.edu,
    score_eco: dims.eco,
  };
}

/**
 * Grava uma avaliação concluída. Sempre com `Prefer: return=minimal`
 * (supabase-js: sem encadear `.select()`) — ver a armadilha documentada em
 * infra/supabase/README.md: um INSERT anônimo com RETURNING falha por RLS,
 * mesmo sendo permitido, porque devolver a linha exigiria visibilidade de
 * SELECT que `anon` não tem de propósito.
 */
export async function submitAssessment(
  answers: Record<string, ScoreLevel>,
  metadata: AssessmentMetadata
): Promise<{ ok: true } | { ok: false; error: string }> {
  const edit_code_hash = await sha256Hex(metadata.code);
  const row = { ...buildRow(answers, metadata), edit_code_hash };

  const { error } = await supabase.from('submissions').insert(row);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

interface SubmissionRow {
  id: string | null;
  taxonomia_versao: number | null;
  setor: string | null;
  esfera: string | null;
  area: string | null;
  atividade_estatal: string | null;
  relacao_ia: string | null;
  estado: string | null;
  porte: string | null;
  termos_aceitos: boolean | null;
  respostas: Record<string, ScoreLevel> | null;
}

function rowToMetadata(row: SubmissionRow, code: string): AssessmentMetadata {
  return {
    taxonomiaVersao: 2,
    setor: (row.setor ?? '') as AssessmentMetadata['setor'],
    esfera: (row.esfera ?? undefined) as AssessmentMetadata['esfera'],
    area: (row.area ?? undefined) as AssessmentMetadata['area'],
    atividadeEstatal: (row.atividade_estatal ?? undefined) as AssessmentMetadata['atividadeEstatal'],
    relacaoIA: (row.relacao_ia ?? undefined) as AssessmentMetadata['relacaoIA'],
    estado: row.estado ?? '',
    porte: row.porte ?? '',
    termosAceitos: row.termos_aceitos ?? true,
    code,
  };
}

/**
 * Busca uma avaliação pelo código digitado pelo usuário (tela "Editar com
 * código") — hasheia no cliente e chama a função RPC `find_submission_by_code_hash`
 * (security definer: não existe policy de SELECT direta para `anon` em
 * `submissions`). Sem resultado, a função RPC devolve uma linha com todos os
 * campos nulos (não um 404) — por isso checamos `row.id`, não o status HTTP,
 * para não vazar se o código existe ou não por timing/formato de resposta.
 */
export async function findAssessmentByCode(
  code: string
): Promise<{ answers: Record<string, ScoreLevel>; metadata: AssessmentMetadata } | null> {
  const p_hash = await sha256Hex(code);
  const { data, error } = await supabase.rpc('find_submission_by_code_hash', { p_hash });
  if (error || !data || !(data as SubmissionRow).id) return null;

  const row = data as SubmissionRow;
  return {
    answers: row.respostas ?? {},
    metadata: rowToMetadata(row, code),
  };
}

/**
 * Atualiza uma avaliação existente (fluxo "Editar com código" → Revisão →
 * salvar de novo). Mesma função RPC `update_submission_by_code_hash` usada
 * para o lookup, agora para escrita — também security definer, pelo mesmo
 * motivo: sem policy de UPDATE direta para `anon`.
 */
export async function updateAssessmentByCode(
  code: string,
  answers: Record<string, ScoreLevel>,
  metadata: AssessmentMetadata
): Promise<{ ok: true } | { ok: false; error: string }> {
  const p_hash = await sha256Hex(code);
  const row = buildRow(answers, metadata);

  const { error } = await supabase.rpc('update_submission_by_code_hash', {
    p_hash,
    p_setor: row.setor,
    p_esfera: row.esfera,
    p_area: row.area,
    p_atividade_estatal: row.atividade_estatal,
    p_relacao_ia: row.relacao_ia,
    p_estado: row.estado,
    p_porte: row.porte,
    p_regiao: row.regiao,
    p_poder: row.poder,
    p_respostas: row.respostas,
    p_score_global: row.score_global,
    p_score_gov: row.score_gov,
    p_score_tec: row.score_tec,
    p_score_seg: row.score_seg,
    p_score_edu: row.score_edu,
    p_score_eco: row.score_eco,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
