'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const SwaggerUI = dynamic(
  () => import('swagger-ui-react').then((mod) => mod.default),
  { ssr: false }
);

export default function APIDocsPage() {
  const [spec, setSpec] = useState(null);

  useEffect(() => {
    fetch('/api/docs')
      .then((res) => res.json())
      .then((data) => setSpec(data))
      .catch((error) => console.error('Error loading API spec:', error));
  }, []);

  if (!spec) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p>Loading API Documentation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="border-b bg-surface-container p-4">
        <h1 className="text-2xl font-bold text-on-surface">Athletic Labs API Documentation</h1>
        <p className="text-on-surface-variant">
          Comprehensive API reference for the Athletic Labs platform
        </p>
      </div>
      <SwaggerUI 
        spec={spec} 
        docExpansion="list"
        displayRequestDuration={true}
        tryItOutEnabled={true}
      />
    </div>
  );
}