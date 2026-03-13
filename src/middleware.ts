import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/login',
  },
});

// Защищаем все маршруты дашборда (включая корень /)
export const config = {
  matcher: [
    '/',
    '/projects/:path*',
    '/organizations/:path*',
    '/documents/:path*',
  ],
};
