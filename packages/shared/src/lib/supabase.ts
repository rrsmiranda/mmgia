/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/// <reference types="vite/client" />

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Lido do app que consome este arquivo (Vite só expõe variáveis com prefixo
// VITE_ no bundle, resolvidas em build/dev time) — cada app (apps/web,
// apps/admin) define as suas em .env.local (nunca commitado; ver .env.example).
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !anonKey) {
  throw new Error(
    'VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY não configuradas. Copie .env.example para .env.local e preencha com os valores da instância Supabase (ver infra/supabase/README.md).'
  );
}

/**
 * Cliente único do Supabase, compartilhado entre apps/web e apps/admin.
 * Usa sempre a ANON_KEY (nunca a service_role) — o isolamento dos "dois
 * mundos" é garantido pelo RLS no banco (infra/supabase/migrations/006_rls_policies.sql),
 * não por qual chave o cliente usa.
 */
export const supabase: SupabaseClient = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
