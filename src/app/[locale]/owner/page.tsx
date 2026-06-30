'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectOwnerPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/owner');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0B0A1F] flex items-center justify-center text-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Redirecting to Owner Panel...</p>
      </div>
    </div>
  );
}
