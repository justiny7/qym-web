import { UserProvider } from '@/contexts/UserContext';
import Navigation from '@/components/Navigation';
import '@/styles/globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <UserProvider>
        <body className="bg-gray-900 text-white">
          <Navigation />
          <main>{children}</main>
        </body>
      </UserProvider>
    </html>
  );
}
