export default function DebugEnv() {
  return (
    <div className="p-8">
      <h1>Environment Debug</h1>
      <pre className="bg-gray-100 p-4 md3-label-small">
        {JSON.stringify({
          NODE_ENV: process.env.NODE_ENV,
          NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 50) + '...',
          NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 50) + '...',
          SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 50) + '...',
          GOOGLE_PLACES_API_KEY: process.env.GOOGLE_PLACES_API_KEY?.substring(0, 20) + '...',
        }, null, 2)}
      </pre>
    </div>
  );
}