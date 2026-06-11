/**
 * Detecta se um erro é causado pelo banco Supabase pausado por inatividade.
 * Supabase pausa projetos no plano gratuito após 1 semana de inatividade.
 */
export function isBancoPausado(error: unknown): boolean {
  const msg = String(error).toLowerCase();
  return (
    msg.includes("econnrefused") ||
    msg.includes("connection refused") ||
    msg.includes("etimedout") ||
    msg.includes("can't reach database server") ||
    msg.includes("connection pool timeout") ||
    msg.includes("p1001") || // Prisma: Can't reach database server
    msg.includes("p1017") || // Prisma: Server closed connection
    msg.includes("connection terminated unexpectedly") ||
    msg.includes("the database system is starting up")
  );
}

export function getBancoPausadoResponse() {
  return {
    error: "banco_pausado",
    mensagem:
      "O banco de dados está pausado por inatividade. Acesse supabase.com, abra o projeto e clique em Restore para reativá-lo. Aguarde ~2 minutos e tente novamente.",
    supabaseUrl: "https://supabase.com/dashboard/project/canqyiuvxdhxlknopqqs",
  };
}
