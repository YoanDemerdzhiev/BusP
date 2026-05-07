'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LostPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/lost/create');
  }, [router]);

  return null;
}
