import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_ROUTES = [
  "/profile",
  "/library",
  "/album",
  "/playlists",
  "/studio",
  "/subscription",
];

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          supabaseResponse = NextResponse.next({
            request: { headers: request.headers },
          });
          supabaseResponse.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          supabaseResponse = NextResponse.next({
            request: { headers: request.headers },
          });
          supabaseResponse.cookies.set({ name, value: "", ...options });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const currentPath = request.nextUrl.pathname;

  const isAdminLoginRoute = currentPath.startsWith("/admin-login");
  const isAdminRoute = currentPath.startsWith("/admin") && !isAdminLoginRoute;

  // BẢO VỆ ROUTE ADMIN
  if (isAdminRoute) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/404";
      return NextResponse.rewrite(url);
    }

    const { data: profile } = await supabase
      .from("user")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "ADMIN") {
      const url = request.nextUrl.clone();
      url.pathname = "/404";
      return NextResponse.rewrite(url);
    }
  }

  const isAuthPage = currentPath.startsWith("/auth/login") || isAdminLoginRoute;

  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    currentPath.startsWith(route),
  );

  // NẾU ĐÃ ĐĂNG NHẬP MÀ VÀO TRANG LOGIN -> ĐẨY VỀ TRANG PHÙ HỢP
  if (user && isAuthPage) {
    const url = request.nextUrl.clone();

    // Nếu đang ở trang admin-login mà đã có user, đẩy về /admin. Ngược lại đẩy về /
    url.pathname = isAdminLoginRoute ? "/admin" : "/";

    const redirectResponse = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectResponse;
  }

  // NẾU CHƯA ĐĂNG NHẬP MÀ VÀO TRANG BẢO VỆ -> ĐẨY RA LOGIN
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("next", currentPath);

    const redirectResponse = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectResponse;
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
