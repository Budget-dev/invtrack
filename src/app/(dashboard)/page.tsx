
'use client';
/**
 * Redundant dashboard page removed to resolve root route collision.
 * All logic is now managed via the monolithic src/app/page.tsx 
 * to support the "Demo Mode" prototype experience.
 */
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  useEffect(() => {
    redirect('/');
  }, []);
  return null;
}
