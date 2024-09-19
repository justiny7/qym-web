'use client';

import { withRoleAccess } from '@/components/withRoleAccess';

function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <p>Welcome to the admin dashboard. Here you can manage gym operations.</p>
      {/* Add more admin features here */}
    </div>
  );
}

export default withRoleAccess(AdminDashboardPage, ['admin']);
