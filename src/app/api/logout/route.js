import { cookies } from "next/headers";

export async function GET(request) {
  const cookieStore = cookies();
  cookieStore.delete("session");

  return Response.redirect(new URL("/login", request.url));
}
