// Password protection for Quartz Garden
// Set QUARTZ_PASSWORD in Vercel environment variables

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.).*)'],
};

export default function middleware(request: Request) {
  const password = process.env.QUARTZ_PASSWORD;
  
  // If no password set, allow all access
  if (!password) {
    return fetch(request);
  }

  // Check for auth cookie
  const cookie = request.headers.get('cookie');
  if (cookie?.includes(`quartz-auth=${password}`)) {
    return fetch(request);
  }

  // Check for basic auth header
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Basic ')) {
    try {
      const base64 = authHeader.slice(6);
      const decoded = atob(base64);
      const pass = decoded.split(':')[1];
      
      if (pass === password) {
        return fetch(request).then(res => {
          const headers = new Headers(res.headers);
          headers.set('Set-Cookie', `quartz-auth=${password}; Max-Age=604800; HttpOnly; Secure; SameSite=Strict`);
          return new Response(res.body, { status: res.status, headers });
        });
      }
    } catch (e) {
      // Invalid auth, fall through to 401
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
