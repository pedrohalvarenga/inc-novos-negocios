"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TerrenoSchema, type TerrenoInput } from "@/lib/validations";
import { UF_OPTIONS, FORMA_PAGAMENTO_LABELS } from "@/lib/constants";
import { Plus, Trash2, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  terrenoId?: string;
  defaultValues?: Partial<TerrenoInput>;
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-black/8 overflow-hidden">
      <div className="px-6 py-4 border-b border-black/6">
        <h2 className="text-sm font-semibold text-black">{title}</h2>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
  full,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", full ? "md:col-span-2" : "")}>
      <label className="text-sm font-medium text-black">{label}</label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

const inputClass =
  "h-10 rounded-lg border border-black/20 px-3 text-sm text-black bg-white outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition placeholder:text-[#A0A0A0]";

export default function TerrenoForm({ terrenoId, defaultValues }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proprietarios, setProprietarios] = useState<any[]>([]);
  const [buscaProprietario, setBuscaProprietario] = useState("");
  const [proprietariosDisponiveis, setProprietariosDisponiveis] = useState<any[]>([]);
  const [showProprietarioSearch, setShowProprietarioSearch] = useState(false);
  const [corretores, setCorretores] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<TerrenoInput>({
    resolver: zodResolver(TerrenoSchema) as any,
    defaultValues: defaultValues ?? {},
  });

  // Busca proprietários
  useEffect(() => {
    if (buscaProprietario.length < 2) return;
    const t = setTimeout(async () => {
      const data = await fetch(`/api/proprietarios?busca=${encodeURIComponent(buscaProprietario)}`).then((r) => r.json());
      setProprietariosDisponiveis(data);
    }, 300);
    return () => clearTimeout(t);
  }, [buscaProprietario]);

  // Carrega corretores
  useEffect(() => {
    fetch("/api/corretores").then((r) => r.json()).then(setCorretores);
  }, []);

  function adicionarProprietario(p: any) {
    if (proprietarios.find((x) => x.id === p.id)) return;
    setProprietarios((prev) => [...prev, { ...p, percentual: null, principal: prev.length === 0 }]);
    setShowProprietarioSearch(false);
    setBuscaProprietario("");
    setProprietariosDisponiveis([]);
  }

  function removerProprietario(id: string) {
    setProprietarios((prev) => prev.filter((p) => p.id !== id));
  }

  async function onSubmit(data: TerrenoInput) {
    setSaving(true);
    setError(null);

    const payload = {
      ...data,
      proprietarios: proprietarios.map((p) => ({
        proprietarioId: p.id,
        percentual: p.percentual ? parseFloat(p.percentual) : null,
        principal: p.principal ?? false,
      })),
    };

    const url = terrenoId ? `/api/terrenos/${terrenoId}` : "/api/terrenos";
    const method = terrenoId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      setError(err.error?.message ?? "Erro ao salvar. Verifique os dados.");
      setSaving(false);
      return;
    }

    const saved = await res.json();
    router.push(`/terrenos/${saved.id}`);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Identificação */}
      <FormSection title="Identificação">
        <Field label="Nome / Descrição *" error={errors.nome?.message}>
          <input {...register("nome")} placeholder="ex: Terreno Av. Paulista" className={inputClass} />
        </Field>
        <Field label="Apelido interno">
          <input {...register("apelido")} placeholder="ex: Paulista 1500" className={inputClass} />
        </Field>
        <Field label="Logradouro *" error={errors.logradouro?.message} full>
          <input {...register("logradouro")} placeholder="Rua, Avenida..." className={inputClass} />
        </Field>
        <Field label="Número">
          <input {...register("numero")} placeholder="123" className={inputClass} />
        </Field>
        <Field label="Complemento">
          <input {...register("complemento")} placeholder="Apto, sala, bloco..." className={inputClass} />
        </Field>
        <Field label="Bairro *" error={errors.bairro?.message}>
          <input {...register("bairro")} placeholder="Nome do bairro" className={inputClass} />
        </Field>
        <Field label="Cidade *" error={errors.cidade?.message}>
          <input {...register("cidade")} placeholder="São Paulo" className={inputClass} />
        </Field>
        <Field label="UF *" error={errors.uf?.message}>
          <select {...register("uf")} className={inputClass}>
            <option value="">Selecione</option>
            {UF_OPTIONS.map((uf) => (
              <option key={uf} value={uf}>{uf}</option>
            ))}
          </select>
        </Field>
        <Field label="CEP">
          <input {...register("cep")} placeholder="00000-000" className={inputClass} />
        </Field>
        <Field label="Área do Terreno (m²) *" error={errors.areaTerreno?.message}>
          <input
            {...register("areaTerreno", { valueAsNumber: true })}
            type="number"
            step="0.01"
            placeholder="500"
            className={inputClass}
          />
        </Field>
      </FormSection>

      {/* Potencial construtivo */}
      <FormSection title="Potencial Construtivo">
        <Field label="Zoneamento">
          <input {...register("zoneamento")} placeholder="ZM-3, ZR-4..." className={inputClass} />
        </Field>
        <Field label="Coeficiente de Aproveitamento">
          <input
            {...register("coeficienteAproveitamento", { valueAsNumber: true })}
            type="number"
            step="0.01"
            placeholder="2.5"
            className={inputClass}
          />
        </Field>
        <Field label="Nº Estimado de Unidades">
          <input
            {...register("numUnidadesEstimado", { valueAsNumber: true })}
            type="number"
            placeholder="80"
            className={inputClass}
          />
        </Field>
        <Field label="Área Privativa Média (m²)">
          <input
            {...register("areaPrivativaMedia", { valueAsNumber: true })}
            type="number"
            step="0.01"
            placeholder="65"
            className={inputClass}
          />
        </Field>
        <Field label="VGV Estimado (R$)">
          <input
            {...register("vgvEstimado", { valueAsNumber: true })}
            type="number"
            step="0.01"
            placeholder="40000000"
            className={inputClass}
          />
        </Field>
      </FormSection>

      {/* Negociação */}
      <FormSection title="Negociação">
        <Field label="Valor Pedido pelo Proprietário (R$)">
          <input
            {...register("valorPedido", { valueAsNumber: true })}
            type="number"
            step="0.01"
            placeholder="5000000"
            className={inputClass}
          />
        </Field>
        <Field label="Valor de Compra Negociado (R$)">
          <input
            {...register("valorCompra", { valueAsNumber: true })}
            type="number"
            step="0.01"
            placeholder="4200000"
            className={inputClass}
          />
        </Field>
        <Field label="Forma de Pagamento">
          <select {...register("formaPagamento")} className={inputClass}>
            <option value="">Selecione</option>
            {Object.entries(FORMA_PAGAMENTO_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </Field>
        <Field label="Prazo (meses)">
          <input
            {...register("prazoPagamento", { valueAsNumber: true })}
            type="number"
            placeholder="36"
            className={inputClass}
          />
        </Field>
        <Field label="% de Permuta">
          <input
            {...register("percentualPermuta", { valueAsNumber: true })}
            type="number"
            step="0.1"
            min="0"
            max="100"
            placeholder="30"
            className={inputClass}
          />
        </Field>
        <Field label="Descrição das Unidades Permutadas" full>
          <textarea
            {...register("descricaoPermuta")}
            placeholder="ex: 3 apartamentos de 65m² no 8º andar"
            rows={3}
            className="rounded-lg border border-black/20 px-3 py-2.5 text-sm text-black bg-white outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition placeholder:text-[#A0A0A0] resize-none"
          />
        </Field>
      </FormSection>

      {/* Proprietários */}
      <div className="bg-white rounded-xl border border-black/8 overflow-hidden">
        <div className="px-6 py-4 border-b border-black/6 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-black">Proprietários / Vendedores</h2>
          <button
            type="button"
            onClick={() => setShowProprietarioSearch(true)}
            className="flex items-center gap-1 text-xs font-medium text-[#F26522] hover:underline"
          >
            <Plus size={13} />
            Adicionar
          </button>
        </div>
        <div className="p-6 space-y-3">
          {showProprietarioSearch && (
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0A0]" />
              <input
                value={buscaProprietario}
                onChange={(e) => setBuscaProprietario(e.target.value)}
                placeholder="Buscar por nome ou CPF/CNPJ..."
                className="h-10 w-full pl-8 pr-4 rounded-lg border border-black/20 text-sm bg-white outline-none focus:border-black transition"
                autoFocus
              />
              {proprietariosDisponiveis.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-black/12 rounded-lg shadow-lg overflow-hidden">
                  {proprietariosDisponiveis.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => adicionarProprietario(p)}
                      className="w-full flex items-start gap-2 px-4 py-3 text-left hover:bg-[#F7F7F7] transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-black">{p.nomeRazaoSocial}</p>
                        {p.cpfCnpj && <p className="text-xs text-[#606060]">{p.cpfCnpj}</p>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {proprietarios.length === 0 && !showProprietarioSearch && (
            <p className="text-sm text-[#A0A0A0] text-center py-4">Nenhum proprietário adicionado</p>
          )}

          {proprietarios.map((p) => (
            <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg bg-[#F7F7F7]">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-black truncate">{p.nomeRazaoSocial}</p>
                {p.cpfCnpj && <p className="text-xs text-[#606060]">{p.cpfCnpj}</p>}
              </div>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={p.percentual ?? ""}
                onChange={(e) =>
                  setProprietarios((prev) =>
                    prev.map((x) => (x.id === p.id ? { ...x, percentual: e.target.value } : x))
                  )
                }
                placeholder="% prop."
                className="w-20 h-8 rounded-lg border border-black/20 px-2 text-xs text-center bg-white outline-none focus:border-black transition"
              />
              <button
                type="button"
                onClick={() => removerProprietario(p.id)}
                className="text-[#A0A0A0] hover:text-red-600 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Corretor */}
      <FormSection title="Corretor / Indicador (opcional)">
        <Field label="Corretor">
          <select {...register("corretorId")} className={inputClass}>
            <option value="">Sem corretor</option>
            {corretores.map((c: any) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
        </Field>
      </FormSection>

      {/* Ações */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="h-10 px-5 rounded-lg border border-black/20 text-sm font-medium text-black hover:bg-[#F7F7F7] transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="h-10 px-6 rounded-lg bg-black text-white text-sm font-medium hover:bg-neutral-800 disabled:opacity-50 transition-colors"
        >
          {saving ? "Salvando…" : terrenoId ? "Salvar Alterações" : "Cadastrar Terreno"}
        </button>
      </div>
    </form>
  );
}
