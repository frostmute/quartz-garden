// Password protection for Quartz Garden

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.).*)'],
};

export default function middleware(request: Request) {
  const password = process.env.QUARTZ_PASSWORD;
  
  // Debug: show what we're checking
  console.log('Password env:', password ? 'SET' : 'NOT SET');
  console.log('Auth header:', request.headers.get('authorization') ? 'PRESENT' : 'NONE');
  
  if (!password) {
    return new Response('No password configured', { status: 500 });
  }

  // Check cookie
  const cookie = request.headers.get('cookie');
  if (cookie?.includes(`quartz-auth=${password}`)) {
    return fetch(request);
  }

  // Check basic auth
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Basic ')) {
    const base64 = authHeader.slice(6);
    const decoded = atob(base64);
    const pass = decoded.split(':')[1];
    
    console.log('Checking password:', pass === password);
    
    if (pass === password) {
      return fetch(request).then(res => {
        const headers = new Headers(res.headers);
        headers.set('Set-Cookie', `quartz-auth=${password}; Max-Age=604800; HttpOnly; Secure; SameSite=Strict`);
        return new Response(res.body, { status: res.status, headers });
      });
    }
  }

  return new Response('Auth required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Garden"' },
  });
}
