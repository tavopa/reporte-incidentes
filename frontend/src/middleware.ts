// Automatically protect all /dashboard/* routes.
// Unauthenticated users are redirected to /login (configured in authOptions.pages).
export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/dashboard/:path*"],
};
