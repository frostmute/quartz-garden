import { next } from '@vercel/edge';

// Password protection for Quartz Garden
// Set QUARTZ_PASSWORD in Vercel environment variables

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.).*)'],
};

export default function middleware(request: Request) {
  const password = process.env.QUARTZ_PASSWORD;
  
  // If no password set, allow all access
  if (!password) {
    return next();
  }

  // Check for auth cookie
  const cookie = request.headers.get('cookie');
  if (cookie?.includes(`quartz-auth=${password}`)) {
    return next();
  }

  // Check for basic auth header
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    const basic = authHeader.split(' ')[1];
    const decoded = atob(basic);
    const [, pass] = decoded.split(':');
    if (pass === password) {
      const response = next();
      // Add cookie to response
      const newHeaders = new Headers(response.headers);
      newHeaders.append('Set-Cookie', `quartz-auth=${password}; Max-Age=${60*60*24*7}; HttpOnly; Secure; SameSite=Strict`);
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
    }
  }

  // Return 401 with auth prompt
  return new Response('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Quartz Garden"',
    },
  });
}
