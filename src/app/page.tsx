import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-6">Welcome to QYM</h1>
      <div className="space-x-4">
        <Link href="/login" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
          Login
        </Link>
        <Link href="/register" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
          Register
        </Link>
      </div>
    </div>
  );
}
