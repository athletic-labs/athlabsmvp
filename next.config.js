const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Bundle optimization
  experimental: {
    optimizeCss: true,
    cssChunking: 'strict', // Optimize CSS chunking
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      '@supabase/supabase-js',
      'date-fns',
      'react-hook-form',
      '@hookform/resolvers'
    ],
  },
  
  // Webpack optimization
  webpack: (config, { isServer, dev }) => {
    if (!dev && !isServer) {
      // Split chunks more aggressively
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
          },
          common: {
            name: 'common',
            minChunks: 2,
            priority: 5,
            reuseExistingChunk: true,
          },
          // Separate critical CSS
          criticalCss: {
            test: /[\\/]styles[\\/](critical|globals)\.css$/,
            name: 'critical',
            priority: 30,
            enforce: true,
          },
          // Feature-specific CSS chunks
          featureCss: {
            test: /[\\/]styles[\\/]features[\\/]/,
            name: 'features',
            priority: 25,
          },
          // Design system CSS
          designSystem: {
            test: /[\\/]styles[\\/]design-system\.css$/,
            name: 'design-system',
            priority: 20,
          },
          // Separate chunk for icons
          icons: {
            test: /[\\/]node_modules[\\/](lucide-react)[\\/]/,
            name: 'icons',
            priority: 20,
          },
          // Separate chunk for animations
          animations: {
            test: /[\\/]node_modules[\\/](framer-motion)[\\/]/,
            name: 'animations',
            priority: 20,
          },
          // Separate chunk for dates
          dates: {
            test: /[\\/]node_modules[\\/](date-fns)[\\/]/,
            name: 'dates',
            priority: 20,
          },
        },
      };
    }
    
    return config;
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Existing headers  
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          
          // CRITICAL: HTTP Strict Transport Security (HSTS)
          { 
            key: 'Strict-Transport-Security', 
            value: 'max-age=31536000; includeSubDomains; preload' 
          },
          
          // CRITICAL: XSS Protection
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          
          // CRITICAL: Content Security Policy (CSP) - Secure Configuration
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Scripts: Allow self and specific external services (NO unsafe-eval)
              "script-src 'self' https://www.googletagmanager.com https://js.sentry-io https://browser.sentry-cdn.com https://www.google-analytics.com",
              // Styles: Allow self, Google Fonts, and inline styles (React style prop)
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https: blob:",
              "media-src 'self' https:",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.sentry.io https://www.google-analytics.com https://maps.googleapis.com",
              "worker-src 'self' blob:",
              "child-src 'self'",
              "frame-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests"
            ].join('; ')
          },
          
          // Additional Security Headers
          { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
          { key: 'X-DNS-Prefetch-Control', value: 'off' },
          { key: 'X-Download-Options', value: 'noopen' },
          
          // Permissions Policy (formerly Feature Policy)
          {
            key: 'Permissions-Policy',
            value: [
              'camera=(), microphone=(), geolocation=()',
              'payment=(), usb=(), magnetometer=()',
              'gyroscope=(), accelerometer=()',
              'ambient-light-sensor=(), autoplay=()',
              'encrypted-media=(), fullscreen=(self)',
              'picture-in-picture=()'
            ].join(', ')
          },
          
          // Cross-Origin Policies  
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
          
          // Cache Control for security-sensitive pages
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' }
        ]
      },
      {
        // More permissive CSP for development
        source: '/api/:path*', 
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self'; object-src 'none';"
          }
        ]
      }
    ];
  },
};

module.exports = nextConfig;