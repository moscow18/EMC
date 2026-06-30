'use client';

import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'emc_form_submissions';
const MAX_SUBMISSIONS = 3;
const WINDOW_MS = 60 * 1000; // 1 minute

interface RateLimitResult {
  canSubmit: boolean;
  remainingSeconds: number;
  checkAndRecord: () => boolean;
}

/**
 * Client-side rate limiter.
 * Tracks submission timestamps in localStorage.
 * Max 3 submissions per minute.
 */
export function useRateLimit(formId: string = 'default'): RateLimitResult {
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const getKey = useCallback(() => `${STORAGE_KEY}_${formId}`, [formId]);

  const getTimestamps = useCallback((): number[] => {
    try {
      const raw = localStorage.getItem(getKey());
      if (!raw) return [];
      const timestamps: number[] = JSON.parse(raw);
      const now = Date.now();
      // Filter to only timestamps within the window
      return timestamps.filter((ts) => now - ts < WINDOW_MS);
    } catch {
      return [];
    }
  }, [getKey]);

  const canSubmit = remainingSeconds <= 0;

  const checkAndRecord = useCallback((): boolean => {
    const timestamps = getTimestamps();
    const now = Date.now();

    if (timestamps.length >= MAX_SUBMISSIONS) {
      // Calculate remaining time from the oldest timestamp in the window
      const oldest = Math.min(...timestamps);
      const remaining = Math.ceil((WINDOW_MS - (now - oldest)) / 1000);
      setRemainingSeconds(Math.max(remaining, 1));
      return false;
    }

    // Record this submission
    timestamps.push(now);
    try {
      localStorage.setItem(getKey(), JSON.stringify(timestamps));
    } catch {
      // localStorage not available, allow submission
    }
    return true;
  }, [getTimestamps, getKey]);

  // Countdown timer
  useEffect(() => {
    if (remainingSeconds <= 0) return;

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [remainingSeconds]);

  return { canSubmit, remainingSeconds, checkAndRecord };
}
