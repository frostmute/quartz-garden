// Password protection for Quartz Garden

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.).*)'],
};

const LOGIN_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Quartz Garden - Login</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0d1117;
      color: #c9d1d9;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
    }
    .login-box {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 12px;
      padding: 40px;
      width: 100%;
      max-width: 360px;
      text-align: center;
    }
    h1 { margin: 0 0 8px; font-size: 24px; color: #f0f6fc; }
    p { margin: 0 0 24px; color: #8b949e; font-size: 14px; }
    input[type="password"] {
      width: 100%;
      padding: 12px 16px;
      background: #0d1117;
      border: 1px solid #30363d;
      border-radius: 8px;
      color: #f0f6fc;
      font-size: 16px;
      margin-bottom: 16px;
    }
    input[type="password"]:focus {
      outline: none;
      border-color: #58a6ff;
    }
    button {
      width: 100%;
      padding: 12px;
      background: #238636;
      border: none;
      border-radius: 8px;
      color: white;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
    }
    button:hover { background: #2ea043; }
    .error { color: #f85149; margin-top: 12px; font-size: 14px; }
  </style>
</head>
<body>
  <div class="login-box">
    <h1>🌱 Quartz Garden</h1>
    <p>Enter password to continue</p>
    <form method="POST" action="/">
      <input type="password" name="password" placeholder="Password" autofocus required>
      <button type="submit">Enter</button>
    </form>
  </div>
</body>
</html>`;

export default function middleware(request: Request) {
  const password = process.env.QUARTZ_PASSWORD;
  const url = new URL(request.url);
  
  if (!password) {
    return fetch(request);
  }

  // Check for auth cookie
  const cookie = request.headers.get('cookie');
  if (cookie?.includes(`quartz-auth=${password}`)) {
    return fetch(request);
  }

  // Handle POST with password
  if (request.method === 'POST') {
    return request.text().then(body => {
      const params = new URLSearchParams(body);
      const submittedPassword = params.get('password');
      
      if (submittedPassword === password) {
        return fetch(request).then(res => {
          const headers = new Headers(res.headers);
          headers.set('Set-Cookie', `quartz-auth=${password}; Max-Age=604800; HttpOnly; Secure; SameSite=Strict; Path=/`);
          headers.set('Location', url.pathname);
          return new Response(null, { status: 302, headers });
        });
      }
      
      // Wrong password - show error
      return new Response(LOGIN_HTML.replace('</form>', '</form><div class="error">Incorrect password</div>'), {
        status: 401,
        headers: { 'Content-Type': 'text/html' },
      });
    });
  }

  // Show login form
  return new Response(LOGIN_HTML, {
    status: 401,
    headers: { 'Content-Type': 'text/html' },
  });
}
