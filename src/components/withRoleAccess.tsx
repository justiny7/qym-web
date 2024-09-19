'use client';

import { useUser } from '@/hooks/useUser';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function withRoleAccess(WrappedComponent: React.ComponentType, allowedRoles: string[]) {
  return function WithRoleAccess(props: any) {
    const { user, loading } = useUser();
    const router = useRouter();

    useEffect(() => {
      if (!loading && (!user || !allowedRoles.includes(user.role))) {
        router.push('/');
      }
    }, [user, loading, router]);

    if (loading) {
      return <div className="flex justify-center items-center h-screen bg-gray-900 text-white">Loading...</div>;
    }

    if (!user || !allowedRoles.includes(user.role)) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}
