"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { formatCurrency } from "@/lib/formatters";

const fmtTick = (v: number) =>
  v >= 1000 ? `R$${(v / 1000).toFixed(0)}k` : `R$${v}`;

interface Props {
  terrenoId?: string;
}

export default function FluxoCaixaGrafico({ terrenoId }: Props) {
  const [dados, setDados] = useState<any[]>([]);

  useEffect(() => {
    const url = terrenoId
      ? `/api/financeiro/fluxo-caixa?terrenoId=${terrenoId}`
      : `/api/financeiro/fluxo-caixa`;
    fetch(url).then((r) => r.json()).then(setDados);
  }, [terrenoId]);

  if (!dados.length) return null;

  return (
    <div className="rounded-xl border border-black/8 bg-white p-6">
      <h2 className="text-sm font-semibold text-black mb-4">Fluxo de Caixa Projetado</h2>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={dados} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#606060" }} />
          <YAxis tickFormatter={fmtTick} tick={{ fontSize: 11, fill: "#606060" }} width={52} />
          <Tooltip formatter={(v: number) => formatCurrency(v)} labelStyle={{ fontWeight: 600 }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="previsto" name="Previsto" fill="#000000" radius={[3, 3, 0, 0]} />
          <Bar dataKey="atrasado" name="Atrasado" fill="#dc2626" radius={[3, 3, 0, 0]} />
          <Bar dataKey="pago" name="Pago" fill="#FF7924" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
