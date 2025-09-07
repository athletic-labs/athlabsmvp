/**
 * Design Consistency Checker - Athletic Labs
 * 
 * Automated tool to identify and report design consistency violations
 * across the entire codebase. Use this to maintain 100% design system compliance.
 */

export interface DesignViolation {
  file: string;
  line?: number;
  type: 'typography' | 'spacing' | 'colors' | 'components';
  severity: 'P0' | 'P1' | 'P2' | 'P3';
  violation: string;
  recommendation: string;
  autoFixable: boolean;
}

// Problematic patterns to search for
export const DESIGN_VIOLATIONS = {
  // Typography violations
  typography: {
    // Tailwind typography classes (should use md3- classes)
    'text-xl': { severity: 'P0' as const, replacement: 'md3-title-large' },
    'text-2xl': { severity: 'P0' as const, replacement: 'md3-headline-medium' },
    'text-3xl': { severity: 'P0' as const, replacement: 'md3-headline-large' },
    'text-4xl': { severity: 'P0' as const, replacement: 'md3-display-small' },
    'text-lg': { severity: 'P1' as const, replacement: 'md3-title-medium' },
    'text-sm': { severity: 'P1' as const, replacement: 'md3-body-small' },
    'font-bold': { severity: 'P0' as const, replacement: 'style={{ fontWeight: 600 }}' },
    'font-semibold': { severity: 'P1' as const, replacement: 'style={{ fontWeight: 500 }}' },
    'font-medium': { severity: 'P2' as const, replacement: 'style={{ fontWeight: 500 }}' }
  },
  
  // Spacing violations (non-4dp grid)
  spacing: {
    'p-3': { severity: 'P1' as const, replacement: 'p-md (16px)' },
    'p-5': { severity: 'P1' as const, replacement: 'p-lg (24px)' },
    'p-7': { severity: 'P1' as const, replacement: 'p-xl (32px)' },
    'm-3': { severity: 'P1' as const, replacement: 'm-md (16px)' },
    'm-5': { severity: 'P1' as const, replacement: 'm-lg (24px)' },
    'm-7': { severity: 'P1' as const, replacement: 'm-xl (32px)' },
    'gap-3': { severity: 'P1' as const, replacement: 'gap-md (16px)' },
    'gap-5': { severity: 'P1' as const, replacement: 'gap-lg (24px)' },
    'gap-7': { severity: 'P1' as const, replacement: 'gap-xl (32px)' },
    'px-3': { severity: 'P1' as const, replacement: 'px-md (16px)' },
    'py-3': { severity: 'P1' as const, replacement: 'py-md (16px)' },
    'mb-3': { severity: 'P1' as const, replacement: 'mb-md (16px)' },
    'mt-3': { severity: 'P1' as const, replacement: 'mt-md (16px)' }
  },
  
  // Color violations (hard-coded colors)
  colors: {
    'electric-blue': { severity: 'P0' as const, replacement: 'var(--md-sys-color-primary)' },
    'navy': { severity: 'P0' as const, replacement: 'var(--md-sys-color-on-surface)' },
    'smoke': { severity: 'P0' as const, replacement: 'var(--md-sys-color-surface-variant)' },
    '#3b82f6': { severity: 'P0' as const, replacement: 'var(--md-sys-color-primary)' },
    '#1a2332': { severity: 'P0' as const, replacement: 'var(--md-sys-color-on-surface)' },
    '#e5e7eb': { severity: 'P0' as const, replacement: 'var(--md-sys-color-surface-variant)' },
    'bg-blue-500': { severity: 'P0' as const, replacement: 'bg-[var(--md-sys-color-primary)]' },
    'text-blue-600': { severity: 'P0' as const, replacement: 'text-[var(--md-sys-color-primary)]' },
    'border-blue-500': { severity: 'P0' as const, replacement: 'border-[var(--md-sys-color-primary)]' }
  },
  
  // Component violations
  components: {
    'shadow-sm': { severity: 'P1' as const, replacement: 'elevation-1' },
    'shadow-md': { severity: 'P1' as const, replacement: 'elevation-2' },
    'shadow-lg': { severity: 'P1' as const, replacement: 'elevation-3' },
    'shadow-xl': { severity: 'P1' as const, replacement: 'elevation-4' },
    'rounded-lg': { severity: 'P2' as const, replacement: 'card-standard (12px border-radius)' },
    'rounded-xl': { severity: 'P2' as const, replacement: 'card-standard or modal-standard' }
  }
};

/**
 * Check a single file for design consistency violations
 */
export function checkFileForViolations(filePath: string, content: string): DesignViolation[] {
  const violations: DesignViolation[] = [];
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    // Check typography violations
    Object.entries(DESIGN_VIOLATIONS.typography).forEach(([pattern, config]) => {
      if (line.includes(pattern)) {
        violations.push({
          file: filePath,
          line: index + 1,
          type: 'typography',
          severity: config.severity,
          violation: `Uses "${pattern}" instead of Material Design 3 typography`,
          recommendation: `Replace with ${config.replacement}`,
          autoFixable: true
        });
      }
    });
    
    // Check spacing violations
    Object.entries(DESIGN_VIOLATIONS.spacing).forEach(([pattern, config]) => {
      if (line.includes(pattern)) {
        violations.push({
          file: filePath,
          line: index + 1,
          type: 'spacing',
          severity: config.severity,
          violation: `Uses "${pattern}" which violates 4dp grid system`,
          recommendation: `Replace with ${config.replacement}`,
          autoFixable: true
        });
      }
    });
    
    // Check color violations
    Object.entries(DESIGN_VIOLATIONS.colors).forEach(([pattern, config]) => {
      if (line.includes(pattern)) {
        violations.push({
          file: filePath,
          line: index + 1,
          type: 'colors',
          severity: config.severity,
          violation: `Uses hard-coded color "${pattern}" instead of design tokens`,
          recommendation: `Replace with ${config.replacement}`,
          autoFixable: true
        });
      }
    });
    
    // Check component violations
    Object.entries(DESIGN_VIOLATIONS.components).forEach(([pattern, config]) => {
      if (line.includes(pattern)) {
        violations.push({
          file: filePath,
          line: index + 1,
          type: 'components',
          severity: config.severity,
          violation: `Uses "${pattern}" instead of design system component`,
          recommendation: `Replace with ${config.replacement}`,
          autoFixable: false
        });
      }
    });
    
    // Check for inline font styles
    if (line.includes('fontSize') || line.includes('fontWeight') || line.includes('lineHeight')) {
      violations.push({
        file: filePath,
        line: index + 1,
        type: 'typography',
        severity: 'P1',
        violation: 'Uses inline font styles instead of Typography component',
        recommendation: 'Use Typography component or md3- classes',
        autoFixable: false
      });
    }
    
    // Check for inline color styles
    if (line.includes('color:') && !line.includes('var(--')) {
      violations.push({
        file: filePath,
        line: index + 1,
        type: 'colors',
        severity: 'P0',
        violation: 'Uses inline color styles instead of CSS variables',
        recommendation: 'Use var(--md-sys-color-*) CSS variables',
        autoFixable: false
      });
    }
  });
  
  return violations;
}

/**
 * Generate auto-fix commands for violations
 */
export function generateAutoFixes(violations: DesignViolation[]): string[] {
  const commands: string[] = [];
  const autoFixableViolations = violations.filter(v => v.autoFixable);
  
  // Group by violation pattern for batch processing
  const violationGroups = autoFixableViolations.reduce((groups, violation) => {
    const pattern = violation.violation.match(/"(.+?)"/)?.[1];
    if (pattern) {
      if (!groups[pattern]) {
        groups[pattern] = [];
      }
      groups[pattern].push(violation);
    }
    return groups;
  }, {} as Record<string, DesignViolation[]>);
  
  // Generate sed commands for each pattern
  Object.entries(violationGroups).forEach(([pattern, patternViolations]) => {
    const replacement = patternViolations[0].recommendation.match(/Replace with (.+)/)?.[1];
    if (replacement) {
      commands.push(
        `# Fix ${patternViolations.length} instances of "${pattern}"\n` +
        `find src -name "*.tsx" -exec sed -i 's/${pattern}/${replacement}/g' {} \\;`
      );
    }
  });
  
  return commands;
}

/**
 * Generate comprehensive report
 */
export function generateConsistencyReport(violations: DesignViolation[]): string {
  const violationsByType = violations.reduce((groups, violation) => {
    if (!groups[violation.type]) {
      groups[violation.type] = [];
    }
    groups[violation.type].push(violation);
    return groups;
  }, {} as Record<string, DesignViolation[]>);
  
  const violationsBySeverity = violations.reduce((groups, violation) => {
    if (!groups[violation.severity]) {
      groups[violation.severity] = [];
    }
    groups[violation.severity].push(violation);
    return groups;
  }, {} as Record<string, DesignViolation[]>);
  
  let report = `# Athletic Labs Design Consistency Report\n\n`;
  
  // Summary
  report += `## Summary\n`;
  report += `- **Total Violations**: ${violations.length}\n`;
  report += `- **P0 (Critical)**: ${violationsBySeverity.P0?.length || 0}\n`;
  report += `- **P1 (High Priority)**: ${violationsBySeverity.P1?.length || 0}\n`;
  report += `- **P2 (Medium Priority)**: ${violationsBySeverity.P2?.length || 0}\n`;
  report += `- **P3 (Low Priority)**: ${violationsBySeverity.P3?.length || 0}\n`;
  report += `- **Auto-fixable**: ${violations.filter(v => v.autoFixable).length}\n\n`;
  
  // Violations by Type
  Object.entries(violationsByType).forEach(([type, typeViolations]) => {
    report += `## ${type.toUpperCase()} Violations (${typeViolations.length})\n\n`;
    
    typeViolations.forEach(violation => {
      report += `### ${violation.severity} - ${violation.file}:${violation.line}\n`;
      report += `**Issue**: ${violation.violation}\n`;
      report += `**Fix**: ${violation.recommendation}\n`;
      report += `**Auto-fixable**: ${violation.autoFixable ? '✅' : '❌'}\n\n`;
    });
  });
  
  // Auto-fix commands
  const autoFixCommands = generateAutoFixes(violations);
  if (autoFixCommands.length > 0) {
    report += `## Auto-Fix Commands\n\n`;
    report += `Run these commands to automatically fix violations:\n\n`;
    report += `\`\`\`bash\n`;
    report += autoFixCommands.join('\n\n');
    report += `\n\`\`\`\n`;
  }
  
  return report;
}

/**
 * Runtime consistency checker for development
 */
export function validateRuntimeConsistency() {
  if (typeof window === 'undefined') return;
  
  const violations: string[] = [];
  
  // Check for problematic typography classes
  const problematicTypographyClasses = [
    'text-xl', 'text-2xl', 'text-3xl', 'text-4xl',
    'font-bold', 'font-semibold', 'font-medium'
  ];
  
  problematicTypographyClasses.forEach(className => {
    const elements = document.querySelectorAll(`.${className}`);
    if (elements.length > 0) {
      violations.push(`⚠️  Found ${elements.length} elements using non-standard class "${className}". Please migrate to Typography component.`);
    }
  });
  
  // Check for problematic spacing classes
  const problematicSpacingClasses = [
    'p-3', 'p-5', 'p-7', 'm-3', 'm-5', 'm-7', 'gap-3', 'gap-5', 'gap-7'
  ];
  
  problematicSpacingClasses.forEach(className => {
    const elements = document.querySelectorAll(`.${className}`);
    if (elements.length > 0) {
      violations.push(`⚠️  Found ${elements.length} elements using non-4dp spacing "${className}". Please use design system spacing.`);
    }
  });
  
  // Check for inline font styles
  const elementsWithInlineStyles = document.querySelectorAll('[style*="font-size"], [style*="font-weight"], [style*="line-height"]');
  if (elementsWithInlineStyles.length > 0) {
    violations.push(`⚠️  Found ${elementsWithInlineStyles.length} elements with inline font styles. Please use Typography component instead.`);
  }
  
  // Check for hard-coded colors
  const elementsWithInlineColors = document.querySelectorAll('[style*="color:"], [style*="background-color:"]');
  let hardCodedColorCount = 0;
  elementsWithInlineColors.forEach(element => {
    const style = (element as HTMLElement).style.cssText;
    if (!style.includes('var(--')) {
      hardCodedColorCount++;
    }
  });
  
  if (hardCodedColorCount > 0) {
    violations.push(`⚠️  Found ${hardCodedColorCount} elements with hard-coded colors. Please use CSS variables.`);
  }
  
  // Log violations
  if (violations.length > 0) {
    console.group('🎨 Design Consistency Violations');
    violations.forEach(violation => console.warn(violation));
    console.groupEnd();
  } else {
    console.log('✅ No design consistency violations found');
  }
  
  return violations;
}

export default {
  checkFileForViolations,
  generateAutoFixes,
  generateConsistencyReport,
  validateRuntimeConsistency,
  DESIGN_VIOLATIONS
};