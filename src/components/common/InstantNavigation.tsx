'use client';

import { useInstantNavigation } from '@/hooks/useInstantNavigation';

// Instant navigation system for lightning-fast page transitions
export default function InstantNavigation() {
  // Use the instant navigation hook for aggressive prefetching
  useInstantNavigation();
  
  return null;
}
