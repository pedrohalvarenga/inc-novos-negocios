import PageHeader from "@/components/common/PageHeader";
import ZenkitConfig from "@/components/financeiro/ZenkitConfig";

export default function ZenkitConfigPage() {
  return (
    <div className="p-8 max-w-3xl space-y-8">
      <PageHeader
        title="Integração Zenkit"
        description="Configure a importação automática de terrenos a partir do Zenkit — acesso restrito a Administradores"
      />
      <ZenkitConfig />
    </div>
  );
}
