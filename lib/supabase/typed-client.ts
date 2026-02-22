import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Helper to bypass Supabase strict insert typing when generated types
 * resolve to `never` due to version mismatches.
 */
export function typedInsert<T extends Record<string, unknown>>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client: SupabaseClient<any>,
  table: string,
  data: T | T[],
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return client.from(table).insert(data as any)
}

export function typedUpdate<T extends Record<string, unknown>>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client: SupabaseClient<any>,
  table: string,
  data: T,
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return client.from(table).update(data as any)
}

export function typedUpsert<T extends Record<string, unknown>>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client: SupabaseClient<any>,
  table: string,
  data: T | T[],
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return client.from(table).upsert(data as any)
}
