'use client';

import React, { useState } from 'react';
import { Palette, Check, Sun, Moon, Monitor, Plus } from 'lucide-react';
import { useMaterial3Theme, type Material3Theme } from '../theme/ThemeProvider';
import { Button } from './Button';
import { Card } from './Card';
import { cn } from '@/lib/utils';

interface ThemeSelectorProps {
  className?: string;
  showModeToggle?: boolean;
  showCustomThemeCreator?: boolean;
}

export function ThemeSelector({ 
  className,
  showModeToggle = true,
  showCustomThemeCreator = true
}: ThemeSelectorProps) {
  const {
    colorScheme,
    themeMode,
    currentTheme,
    workspaceThemes,
    setThemeMode,
    setTheme,
    generateThemeFromColor
  } = useMaterial3Theme();

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customColor, setCustomColor] = useState('#00697b');

  const handleCreateCustomTheme = () => {
    const theme = generateThemeFromColor(customColor, `Custom ${customColor}`);
    setTheme(theme);
    setShowColorPicker(false);
  };

  const modeOptions = [
    { key: 'light' as const, label: 'Light', icon: Sun },
    { key: 'dark' as const, label: 'Dark', icon: Moon },
    { key: 'system' as const, label: 'System', icon: Monitor }
  ];

  return (
    <div className={cn('space-y-6', className)}>
      {/* Theme Mode Toggle */}
      {showModeToggle && (
        <div>
          <h3 className="md3-title-medium font-semibold mb-3 text-[var(--md-sys-color-on-surface)]">
            Theme Mode
          </h3>
          <div className="flex gap-2">
            {modeOptions.map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant={themeMode === key ? 'filled' : 'outlined'}
                size="medium"
                leftIcon={<Icon className="w-4 h-4" />}
                onClick={() => setThemeMode(key)}
                className="flex-1"
              >
                {label}
              </Button>
            ))}
          </div>
          <p className="md3-body-small text-[var(--md-sys-color-on-surface-variant)] mt-2">
            Currently using <strong>{colorScheme}</strong> theme
          </p>
        </div>
      )}

      {/* Theme Selection */}
      <div>
        <h3 className="md3-title-medium font-semibold mb-3 text-[var(--md-sys-color-on-surface)]">
          Color Theme
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {workspaceThemes.map((theme) => (
            <ThemePreviewCard
              key={theme.id}
              theme={theme}
              isActive={currentTheme.id === theme.id}
              onClick={() => setTheme(theme)}
            />
          ))}
        </div>
      </div>

      {/* Custom Theme Creator */}
      {showCustomThemeCreator && (
        <div>
          <h3 className="md3-title-medium font-semibold mb-3 text-[var(--md-sys-color-on-surface)]">
            Custom Theme
          </h3>
          
          {!showColorPicker ? (
            <Button
              variant="outlined"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setShowColorPicker(true)}
              className="w-full"
            >
              Create Custom Theme
            </Button>
          ) : (
            <Card variant="outlined" className="p-4">
              <div className="space-y-4">
                <div>
                  <label className="md3-body-medium font-medium text-[var(--md-sys-color-on-surface)] block mb-2">
                    Choose Primary Color
                  </label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="color"
                      value={customColor}
                      onChange={(e) => setCustomColor(e.target.value)}
                      className="w-12 h-10 rounded-lg border border-[var(--md-sys-color-outline)] cursor-pointer"
                    />
                    <input
                      type="text"
                      value={customColor}
                      onChange={(e) => setCustomColor(e.target.value)}
                      placeholder="#00697b"
                      className="flex-1 px-3 py-2 border border-[var(--md-sys-color-outline)] rounded-lg md3-body-medium bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)]"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="filled"
                    leftIcon={<Palette className="w-4 h-4" />}
                    onClick={handleCreateCustomTheme}
                    className="flex-1"
                  >
                    Apply Theme
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setShowColorPicker(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

interface ThemePreviewCardProps {
  theme: Material3Theme;
  isActive: boolean;
  onClick: () => void;
}

function ThemePreviewCard({ theme, isActive, onClick }: ThemePreviewCardProps) {
  return (
    <Card
      variant={isActive ? 'filled' : 'outlined'}
      className={cn(
        'p-3 cursor-pointer transition-all duration-200 hover:md-elevation-2',
        isActive && 'ring-2 ring-[var(--md-sys-color-primary)]'
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        {/* Color Preview */}
        <div className="relative flex-shrink-0">
          <div
            className="w-8 h-8 rounded-full border border-[var(--md-sys-color-outline)]"
            style={{ backgroundColor: theme.seedColor }}
          />
          {isActive && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
        
        {/* Theme Info */}
        <div className="flex-1 min-w-0">
          <h4 className="md3-title-small font-semibold text-[var(--md-sys-color-on-surface)] truncate">
            {theme.name}
          </h4>
          {theme.description && (
            <p className="md3-body-small text-[var(--md-sys-color-on-surface-variant)] truncate">
              {theme.description}
            </p>
          )}
        </div>
        
        {/* Active Indicator */}
        {isActive && (
          <div className="flex-shrink-0">
            <div className="w-2 h-2 bg-[var(--md-sys-color-primary)] rounded-full" />
          </div>
        )}
      </div>
    </Card>
  );
}

// Quick theme switcher component for navigation/toolbar
interface QuickThemeSwitcherProps {
  className?: string;
}

export function QuickThemeSwitcher({ className }: QuickThemeSwitcherProps) {
  const { colorScheme, themeMode, setThemeMode } = useMaterial3Theme();
  
  const getNextMode = () => {
    const modes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
    const currentIndex = modes.indexOf(themeMode);
    return modes[(currentIndex + 1) % modes.length];
  };
  
  const getIcon = () => {
    switch (themeMode) {
      case 'light':
        return Sun;
      case 'dark':
        return Moon;
      case 'system':
        return Monitor;
      default:
        return Sun;
    }
  };
  
  const Icon = getIcon();
  
  return (
    <Button
      variant="text"
      size="medium"
      leftIcon={<Icon className="w-5 h-5" />}
      onClick={() => setThemeMode(getNextMode())}
      className={cn('p-2', className)}
      aria-label={`Switch to ${getNextMode()} theme`}
    />
  );
}