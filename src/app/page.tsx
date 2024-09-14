import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">Welcome to My App</h1>
      <Link href="/login" className="text-blue-500 hover:text-blue-700">
        Go to Login
      </Link>
      <Link href="/dashboard" className="text-blue-500 hover:text-blue-700">
        Go to Dashboard
      </Link>
    </main>
  );
}
