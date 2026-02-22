'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/api';
import SIADashboard from '@/components/ui/SIADashboard';

export default function PlatformPage() {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/');
    }
  }, [router]);

  if (!isAuthenticated()) return null;

  // Wrap in a full-viewport container so SIADashboard height:'100%' works
  // and the settings sidebar footer is always visible
  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      background: '#0A0818',
    }}>
      <SIADashboard />
    </div>
  );
}
