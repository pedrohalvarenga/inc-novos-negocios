import TerrenoDetail from "@/components/terrenos/TerrenoDetail";

export default async function TerrenoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TerrenoDetail id={id} />;
}
