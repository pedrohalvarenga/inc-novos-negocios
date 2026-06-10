import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const logs = await prisma.zenkitSyncLog.findMany({
    orderBy: { iniciado: "desc" },
    take: 20,
  });
  return NextResponse.json(logs);
}
