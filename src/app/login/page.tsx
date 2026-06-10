"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("E-mail ou senha incorretos. Verifique seus dados e tente novamente.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <Image
            src="/brand/logo-web.png"
            alt="INC Empreendimentos"
            width={200}
            height={52}
            priority
          />
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-8">
          <h1 className="text-xl font-semibold text-black mb-1">Entrar no sistema</h1>
          <p className="text-sm text-[#606060] mb-8">Novos Negócios — INC Empreendimentos</p>

          {error && (
            <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1.5" htmlFor="email">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="voce@inc.com.br"
                className="w-full h-11 rounded-lg border border-black/20 bg-white px-3.5 text-sm text-black placeholder:text-[#A0A0A0] outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1.5" htmlFor="password">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full h-11 rounded-lg border border-black/20 bg-white px-3.5 text-sm text-black placeholder:text-[#A0A0A0] outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg bg-black text-white text-sm font-medium hover:bg-neutral-800 active:bg-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed transition mt-2"
            >
              {loading ? "Entrando…" : "Entrar"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#A0A0A0] mt-6">
          Acesso restrito a colaboradores da INC
        </p>
      </div>
    </div>
  );
}
