#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Files to clean up console.log statements from
const filesToClean = [
  'src/lib/auth/auth-service.ts',
  'src/middleware.ts',
  'src/lib/supabase/rls-cache.ts',
  'src/lib/components/OAuthButton.tsx',
  'src/lib/auth/oauth-service.ts',
  'src/app/(auth)/login/page.tsx',
  'src/app/auth/callback/route.ts',
  'src/lib/utils/css-loader.ts',
  'src/lib/cache/redis-client.ts',
  'src/lib/services/template-service.ts',
  'src/lib/middleware/cors-middleware.ts',
  'src/lib/auth/password-policy.ts',
  'src/lib/middleware/distributed-rate-limit.ts',
  'src/lib/middleware/adaptive-rate-limit.ts',
  'src/lib/supabase/server.ts',
  'src/lib/supabase/client.ts',
  'src/lib/middleware/cache-manager.ts',
  'src/app/(dashboard)/saved-templates/page.tsx',
  'src/lib/auth/simple-auth.ts',
  'src/components/calendar/TeamCalendar.tsx'
];

// Skip these files as they should keep console logs
const skipFiles = [
  'src/lib/utils/logger.ts',
  'src/utils/design-consistency-checker.ts'
];

function cleanConsoleLogsFromFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let originalContent = content;

  // Patterns to remove console.log statements
  const patterns = [
    // Simple console.log statements
    /^\s*console\.log\([^;]*\);?\s*$/gm,
    // Console.log with multiline content
    /^\s*console\.log\(\s*[\s\S]*?\s*\);?\s*$/gm,
    // Console.log in the middle of other code (more careful)
    /console\.log\([^;]*\);\s*/g,
    // Template literal console.logs
    /console\.log\(`[^`]*`[^;]*\);?\s*/g,
    // Object console.logs
    /console\.log\(\s*{[^}]*}\s*\);?\s*/g,
  ];

  patterns.forEach(pattern => {
    content = content.replace(pattern, '');
  });

  // Clean up empty lines left behind
  content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Cleaned console.log statements from: ${filePath}`);
  } else {
    console.log(`ℹ️  No console.log statements found in: ${filePath}`);
  }
}

function main() {
  console.log('🧹 Removing console.log statements from production files...\n');

  filesToClean.forEach(file => {
    if (!skipFiles.some(skipFile => file.includes(skipFile))) {
      cleanConsoleLogsFromFile(file);
    }
  });

  console.log('\n✨ Console.log cleanup completed!');
  console.log('\n📋 Next steps:');
  console.log('1. Run npm test to ensure nothing broke');
  console.log('2. Run npm run build to verify production build');
  console.log('3. Replace remaining alert() calls with proper UI');
}

main();