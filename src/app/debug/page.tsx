'use client';

export default function DebugPage() {
  const envVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
    NODE_ENV: process.env.NODE_ENV,
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Athletic Labs Debug</h1>
      <h2>Environment Variables:</h2>
      <pre>{JSON.stringify(envVars, null, 2)}</pre>
      
      <h2>Navigation Test:</h2>
      <div>
        <a href="/" style={{ marginRight: '10px' }}>Home</a>
        <a href="/login" style={{ marginRight: '10px' }}>Login</a>
        <a href="/dashboard" style={{ marginRight: '10px' }}>Dashboard</a>
      </div>
      
      <h2>Component Test:</h2>
      <p>If you can see this page, Next.js routing is working.</p>
    </div>
  );
}