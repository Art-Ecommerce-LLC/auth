'use client';

import dynamic from 'next/dynamic';

// Default-export dynamic ensures default import works
export default dynamic(() => import('./PermitMapClient'), {
  ssr: false,
  loading: () => <p className="text-center text-sm text-muted-foreground">Loading map…</p>,
});

