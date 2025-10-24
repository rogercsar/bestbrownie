import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      const pathname = req.nextUrl.pathname;
      if (pathname.startsWith("/admin")) {
        return (token as any)?.role === "ADMIN";
      }
      return true;
    },
  },
});

export const config = {
  matcher: ["/admin/:path*"],
};