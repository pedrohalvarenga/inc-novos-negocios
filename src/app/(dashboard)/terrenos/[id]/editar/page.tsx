"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import TerrenoForm from "@/components/terrenos/TerrenoForm";
import PageHeader from "@/components/common/PageHeader";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function EditarTerrenoPage() {
  const params = useParams();
  const id = params.id as string;
  const [terreno, setTerreno] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/terrenos/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setTerreno(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="p-8 animate-pulse"><div className="h-8 w-48 bg-gray-100 rounded" /></div>;

  if (!terreno || terreno.error) return <div className="p-8"><p>Terreno não encontrado.</p></div>;

  const defaultValues = {
    ...terreno,
    dataProspeccao: terreno.dataProspeccao
      ? new Date(terreno.dataProspeccao).toISOString().split("T")[0]
      : undefined,
    proprietarios: terreno.proprietarios?.map((tp: any) => ({
      proprietarioId: tp.proprietario.id,
      percentual: tp.percentual,
      principal: tp.principal,
    })) ?? [],
  };

  return (
    <div className="p-8 max-w-4xl">
      <Link
        href={`/terrenos/${id}`}
        className="flex items-center gap-1 text-sm text-[#606060] hover:text-black transition-colors mb-6"
      >
        <ChevronLeft size={15} />
        Voltar ao Terreno
      </Link>
      <PageHeader
        title={`Editar: ${terreno.nome}`}
        description="Atualize as informações do terreno"
        className="mb-8"
      />
      <TerrenoForm terrenoId={id} defaultValues={defaultValues} />
    </div>
  );
}
