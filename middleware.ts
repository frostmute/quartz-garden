// Password protection for Quartz Garden
// Set QUARTZ_PASSWORD in Vercel environment variables

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.).*)'],
};

export default function middleware(request: Request) {
  // Get password from env - try both ways for edge runtime
  const password = process.env.QUARTZ_PASSWORD || (globalThis as any).QUARTZ_PASSWORD;
  
  // Debug: if no password, show error and allow access
  if (!password) {
    return new Response('Password not configured', { status: 500 });
  }

  // Check for auth cookie
  const cookie = request.headers.get('cookie');
  if (cookie?.includes(`quartz-auth=${password}`)) {
    return fetch(request);
  }

  // Check for basic auth header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Basic ')) {
    try {
      const base64 = authHeader.split(' ')[1];
      const decoded = atob(base64);
      const [, pass] = decoded.split(':');
      
      if (pass === password) {
        return fetch(request).then(res => {
          const newHeaders = new Headers(res.headers);
          newHeaders.append('Set-Cookie', `quartz-auth=${password}; Max-Age=${60*60*24*7}; HttpOnly; Secure; SameSite=Strict`);
          return new Response(res.body, {
            status: res.status,
            statusText: res.statusText,
            headers: newHeaders,
          });
        });
      }
    } catch (e) {
      // Invalid base64, fall through to 401
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
