// Variaveis de ambiente podem vir com BOM (U+FEFF) ou caracteres invisiveis
// quando coladas no painel da Vercel - isso quebra os headers do fetch.
export function cleanEnv(value: string | undefined): string {
  return (value ?? "").replace(/[﻿​ ]/g, "").trim();
}
