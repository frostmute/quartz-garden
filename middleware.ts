// Password protection for Quartz Garden

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.).*)'],
};

export default function middleware(request: Request) {
  const password = process.env.QUARTZ_PASSWORD;
  const authHeader = request.headers.get('authorization');
  
  // Debug logging
  console.log('Env password length:', password?.length || 0);
  console.log('Auth header:', authHeader);
  
  if (!password) {
    return new Response('No password configured', { status: 500 });
  }

  // Check cookie
  const cookie = request.headers.get('cookie');
  if (cookie?.includes(`quartz-auth=${password}`)) {
    return fetch(request);
  }

  // Check basic auth
  if (authHeader?.startsWith('Basic ')) {
    const base64 = authHeader.slice(6);
    console.log('Base64:', base64);
    
    try {
      const decoded = atob(base64);
      console.log('Decoded:', decoded);
      
      const parts = decoded.split(':');
      const user = parts[0];
      const pass = parts[1];
      
      console.log('User:', user);
      console.log('Pass length:', pass?.length);
      console.log('Match:', pass === password);
      
      if (pass === password) {
        return fetch(request).then(res => {
          const headers = new Headers(res.headers);
          headers.set('Set-Cookie', `quartz-auth=${password}; Max-Age=604800; HttpOnly; Secure; SameSite=Strict`);
          return new Response(res.body, { status: res.status, headers });
        });
      }
    } catch (e) {
      console.log('Decode error:', e);
    }
  }

  return new Response('Auth required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Garden"' },
  });
}
