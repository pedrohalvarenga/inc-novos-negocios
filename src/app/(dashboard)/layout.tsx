import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import Sidebar from "@/components/layout/Sidebar";
import SinoNotificacoes from "@/components/notificacoes/SinoNotificacoes";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <main className="flex-1 ml-60 min-h-screen overflow-x-hidden">
        <div className="fixed top-3 right-4 z-30">
          <SinoNotificacoes />
        </div>
        {children}
      </main>
    </div>
  );
}
