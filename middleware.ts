import { NextRequest, NextResponse } from "next/server";

export function middleware(_: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
