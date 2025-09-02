'use client';

/**
 * Live Region Component
 * For announcing dynamic content changes to screen readers
 */

import React, { useEffect, useRef } from 'react';

interface LiveRegionProps {
  message?: string;
  priority?: 'polite' | 'assertive';
  clearOnUnmount?: boolean;
}

export function LiveRegion({ 
  message, 
  priority = 'polite',
  clearOnUnmount = true 
}: LiveRegionProps) {
  const regionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (message && regionRef.current) {
      // Clear previous message first for reliable announcement
      regionRef.current.textContent = '';
      
      // Set new message after a brief delay
      setTimeout(() => {
        if (regionRef.current) {
          regionRef.current.textContent = message;
        }
      }, 100);
    }
  }, [message]);

  useEffect(() => {
    return () => {
      if (clearOnUnmount && regionRef.current) {
        regionRef.current.textContent = '';
      }
    };
  }, [clearOnUnmount]);

  return (
    <div
      ref={regionRef}
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    />
  );
}

// Hook for live announcements
export function useLiveAnnouncer() {
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const event = new CustomEvent('live-announce', {
      detail: { message, priority }
    });
    
    window.dispatchEvent(event);
  };

  return { announce };
}

// Global live announcer component
export function GlobalLiveAnnouncer() {
  const [announcement, setAnnouncement] = React.useState<{
    message: string;
    priority: 'polite' | 'assertive';
  } | null>(null);

  useEffect(() => {
    const handleAnnouncement = (event: CustomEvent) => {
      setAnnouncement(event.detail);
      
      // Clear after announcement
      setTimeout(() => setAnnouncement(null), 1000);
    };

    window.addEventListener('live-announce', handleAnnouncement as EventListener);
    
    return () => {
      window.removeEventListener('live-announce', handleAnnouncement as EventListener);
    };
  }, []);

  if (!announcement) return null;

  return (
    <LiveRegion
      message={announcement.message}
      priority={announcement.priority}
    />
  );
}