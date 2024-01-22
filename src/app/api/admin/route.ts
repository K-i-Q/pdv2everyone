import { currentRole } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const userRole = await currentRole();
  // if (userRole === UserRole.ADMIN) {
  //   return new NextResponse(null, { status: 200 });
  // }
  return new NextResponse(null, { status: 403 });
}
