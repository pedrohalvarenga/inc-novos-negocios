// Rate limiting simples em memória — 1 chamada de IA por usuário a cada 10s
const cache = new Map<string, number>();

export function checkRateLimit(userId: string, windowMs = 10_000): boolean {
  const now = Date.now();
  const last = cache.get(userId) ?? 0;
  if (now - last < windowMs) return false;
  cache.set(userId, now);
  // Limpa entradas antigas a cada 1000 requisições
  if (cache.size > 1000) {
    const cutoff = now - windowMs;
    for (const [k, v] of cache) if (v < cutoff) cache.delete(k);
  }
  return true;
}
