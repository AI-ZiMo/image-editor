import { Navbar } from "@/components/navbar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar showAuthButton={false} />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
