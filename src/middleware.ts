import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./app/lib/auth";

export const config = {
  matcher: ["/((?=overview|expenses|debts|settings/).*)"],
};

export async function middleware(request: NextRequest) {
  const re: RegExp = /[^/]+(?=\/$|$)/;
  const id: string = request.nextUrl.pathname.match(re)?.[0] || "";
  const cookie = request.cookies.get("token");
  const token = cookie?.value || "";

  const { isValidForId } = await verifyToken(token);

  if (!isValidForId(id)) {
    return NextResponse.redirect(new URL(`/auth/${id}`, request.url));
  }
}
