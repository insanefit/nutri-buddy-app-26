import type { NextRequest } from "next/server";
import { updateSession } from "./platform/supabase/update-session";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
