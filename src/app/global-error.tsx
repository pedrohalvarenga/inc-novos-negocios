"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isBancoPausado =
    error?.message?.toLowerCase().includes("banco_pausado") ||
    error?.message?.toLowerCase().includes("econnrefused") ||
    error?.message?.toLowerCase().includes("can't reach database");

  return (
    <html lang="pt-BR">
      <body style={{ fontFamily: "Arial, sans-serif", background: "#f7f7f7", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", margin: 0 }}>
        <div style={{ maxWidth: 480, background: "#fff", borderRadius: 12, border: "1px solid #e5e5e5", overflow: "hidden" }}>
          <div style={{ background: "#000", padding: "20px 24px" }}>
            <span style={{ color: "#FF7924", fontSize: 18, fontWeight: 700 }}>INC Empreendimentos</span>
            <span style={{ color: "#fff", fontSize: 12, marginLeft: 8 }}>Novos Negócios</span>
          </div>
          <div style={{ padding: 24 }}>
            {isBancoPausado ? (
              <>
                <h2 style={{ margin: "0 0 12px", color: "#000", fontSize: 16 }}>Banco de dados pausado</h2>
                <p style={{ color: "#606060", fontSize: 14, lineHeight: 1.6, margin: "0 0 16px" }}>
                  O Supabase pausa projetos do plano gratuito após 1 semana sem acesso.
                  Para reativar:
                </p>
                <ol style={{ color: "#606060", fontSize: 14, lineHeight: 2, paddingLeft: 20, margin: "0 0 20px" }}>
                  <li>Acesse <a href="https://supabase.com/dashboard/project/canqyiuvxdhxlknopqqs" target="_blank" style={{ color: "#FF7924" }}>supabase.com</a></li>
                  <li>Abra o projeto <strong>inc-novos-negocios</strong></li>
                  <li>Clique em <strong>Restore project</strong></li>
                  <li>Aguarde ~2 minutos</li>
                </ol>
              </>
            ) : (
              <>
                <h2 style={{ margin: "0 0 12px", color: "#000", fontSize: 16 }}>Erro inesperado</h2>
                <p style={{ color: "#606060", fontSize: 14, lineHeight: 1.6, margin: "0 0 16px" }}>
                  Ocorreu um erro ao carregar o sistema. Tente recarregar a página.
                </p>
                {error?.message && (
                  <pre style={{ background: "#f5f5f5", padding: 12, borderRadius: 6, fontSize: 11, overflow: "auto", margin: "0 0 16px" }}>
                    {error.message}
                  </pre>
                )}
              </>
            )}
            <button
              onClick={reset}
              style={{ background: "#FF7924", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
