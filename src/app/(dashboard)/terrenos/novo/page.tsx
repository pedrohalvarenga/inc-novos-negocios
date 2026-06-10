import TerrenoForm from "@/components/terrenos/TerrenoForm";
import PageHeader from "@/components/common/PageHeader";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function NovoTerrenoPage() {
  return (
    <div className="p-8 max-w-4xl">
      <Link
        href="/terrenos"
        className="flex items-center gap-1 text-sm text-[#606060] hover:text-black transition-colors mb-6"
      >
        <ChevronLeft size={15} />
        Voltar para Terrenos
      </Link>
      <PageHeader
        title="Novo Terreno"
        description="Preencha as informações do terreno"
        className="mb-8"
      />
      <TerrenoForm />
    </div>
  );
}
