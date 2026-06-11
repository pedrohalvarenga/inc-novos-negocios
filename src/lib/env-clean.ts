// Variaveis de ambiente podem vir com BOM (U+FEFF), caracteres invisiveis
// ou aspas quando coladas no painel da Vercel - isso quebra fetch e conexoes.
export function cleanEnv(value: string | undefined): string {
  return (value ?? "")
    .replace(/[﻿​ ]/g, "")
    .trim()
    .replace(/^["']|["']$/g, "");
}

// Aceita DATABASE_URL com aspas e senha sem URL-encoding (ex.: com "@" ou "!").
// O ultimo "@" separa credenciais do host; a senha e re-encodada.
export function cleanDatabaseUrl(value: string | undefined): string {
  const url = cleanEnv(value);
  const match = url.match(/^(postgres(?:ql)?:\/\/)([^:@]+):(.*)@([^@]+)$/);
  if (!match) return url;
  const [, scheme, user, pass, rest] = match;
  let decoded = pass;
  try {
    decoded = decodeURIComponent(pass);
  } catch {
    // senha ja contem "%" literal sem encoding valido
  }
  return `${scheme}${user}:${encodeURIComponent(decoded)}@${rest}`;
}
