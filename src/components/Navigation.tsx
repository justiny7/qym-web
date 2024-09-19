'use client';

import Link from 'next/link';
import { useUser } from '@/hooks/useUser';

export default function Navigation() {
  const { user, logout } = useUser();

  return (
    <nav className="bg-gray-800 text-white p-4">
      <ul className="flex space-x-4">
        <li><Link href="/" className="hover:text-gray-300">Home</Link></li>
        {user && (
          <>
            {user.role === 'admin' ? (
              <li><Link href="/admin-dashboard" className="hover:text-gray-300">Admin Dashboard</Link></li>
            ) : (
              <li><Link href="/dashboard" className="hover:text-gray-300">Dashboard</Link></li>
            )}
            <li><button onClick={logout} className="hover:text-gray-300">Logout</button></li>
          </>
        )}
        {!user && (
          <>
            <li><Link href="/login" className="hover:text-gray-300">Login</Link></li>
            <li><Link href="/register" className="hover:text-gray-300">Register</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
}
