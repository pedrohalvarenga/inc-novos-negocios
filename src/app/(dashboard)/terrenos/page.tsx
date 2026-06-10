import { Suspense } from "react";
import TerrenosContent from "@/components/terrenos/TerrenosContent";

export default function TerrenosPage() {
  return (
    <div className="p-8">
      <Suspense fallback={<div className="animate-pulse space-y-4"><div className="h-8 w-48 bg-gray-100 rounded" /><div className="h-96 bg-gray-100 rounded-xl" /></div>}>
        <TerrenosContent />
      </Suspense>
    </div>
  );
}
