import FloatingDock from '@/components/FloatingDock';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  
  if (!session) {
    redirect('/api/auth/force-logout');
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-purple-200 pb-24 relative overflow-hidden">
      {/* Global Background Effects */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-purple-300/30 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-4 sm:p-6 md:px-12 md:py-6">
        {children}
      </main>
      
      <FloatingDock />
    </div>
  );
}
