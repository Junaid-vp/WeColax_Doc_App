import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { Activity, ShieldCheck } from 'lucide-react';
import Image from 'next/image';



export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const currentSession = await getSession();
  
  if (!currentSession) return null;

  const user = await prisma.user.findUnique({
    where: { id: currentSession.userId },
    include: {
      sessions: {
        orderBy: { lastActiveAt: 'desc' }
      }
    }
  });

  return (
    <div className="space-y-6 sm:space-y-8 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex justify-between items-end pb-4 sm:pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-500">
            Welcome, {user?.role}
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-green-500" /> Secure Vault Active
          </p>
        </div>
      </header>

      {/* Welcome Banner */}
      <section className="bg-gradient-to-r from-purple-100 via-blue-50 to-purple-100 border border-purple-200/50 rounded-2xl sm:rounded-3xl p-5 sm:p-8 relative overflow-hidden backdrop-blur-xl shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-300/20 blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-300/20 blur-[80px] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 tracking-tight">Welcome to the Executive Vault</h2>
            <p className="text-slate-600 max-w-xl text-xs sm:text-sm leading-relaxed">
              This secure portal provides you with centralized access to sensitive documents, audit logs, and session management.
            </p>
          </div>
          <div className="flex gap-3 sm:gap-4 shrink-0 w-full sm:w-auto">
            <div className="p-3 sm:p-4 bg-white/70 rounded-xl sm:rounded-2xl border border-slate-200 flex flex-col items-center justify-center flex-1 sm:min-w-[110px] shadow-sm backdrop-blur-md">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 mb-1 sm:mb-2" />
              <span className="text-[10px] sm:text-xs text-slate-500 font-medium uppercase tracking-wider">Status</span>
              <span className="text-xs sm:text-sm font-bold text-slate-900 mt-1">Secured</span>
            </div>
            <div className="p-3 sm:p-4 bg-white/70 rounded-xl sm:rounded-2xl border border-slate-200 flex flex-col items-center justify-center flex-1 sm:min-w-[110px] shadow-sm backdrop-blur-md">
              <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 mb-1 sm:mb-2" />
              <span className="text-[10px] sm:text-xs text-slate-500 font-medium uppercase tracking-wider">Nodes</span>
              <span className="text-xs sm:text-sm font-bold text-slate-900 mt-1">{user?.sessions.length} Active</span>
            </div>
          </div>
        </div>
      </section>

      {/* About WeColax Section */}
      <section className="bg-white/70 border border-slate-200 rounded-2xl sm:rounded-3xl p-5 sm:p-8 relative overflow-hidden backdrop-blur-xl shadow-sm">
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-6 tracking-tight">Platform Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
          <div>
            <h4 className="text-base sm:text-lg font-bold text-purple-700 mb-2">What is WeColax?</h4>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              WeColax is the premier content marketplace that makes getting quality content simple. We bridge the gap between businesses and verified creative professionals.
            </p>
          </div>
          <div>
            <h4 className="text-base sm:text-lg font-bold text-blue-700 mb-2">Vault Data Access</h4>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              This dashboard provides executive-level access to sensitive internal data, encrypted audit logs, and global session management.
            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="bg-white/70 border border-slate-200 rounded-2xl sm:rounded-3xl p-5 sm:p-8 relative overflow-hidden backdrop-blur-xl shadow-sm">
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-6 tracking-tight text-center">We are WeColax family</h3>
        
        {/* Team Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-10">
          {/* CEO */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow shadow-sm">
            <h4 className="text-xl font-bold text-slate-900">Fuad Zaneen</h4>
            <p className="text-slate-500 text-sm mb-1">Founder & CEO</p>
            <p className="text-blue-600 text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase mb-4 mt-2">Vision • Strategy • Growth</p>
            <p className="text-slate-600 text-sm leading-relaxed">
              Steering the company&apos;s overarching vision, securing strategic partnerships, and accelerating global market growth.
            </p>
          </div>

          {/* COO */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow shadow-sm">
            <h4 className="text-xl font-bold text-slate-900">Shaheem Afsal</h4>
            <p className="text-slate-500 text-sm mb-1">Co-Founder & COO</p>
            <p className="text-green-600 text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase mb-4 mt-2">Operations • People • Execution</p>
            <p className="text-slate-600 text-sm leading-relaxed">
              Ensuring flawless day-to-day operations, scaling the internal team, and executing business strategies with precision.
            </p>
          </div>

          {/* CTO */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow shadow-sm">
            <h4 className="text-xl font-bold text-slate-900">Mohammed Junaid</h4>
            <p className="text-slate-500 text-sm mb-1">Co-Founder & CTO</p>
            <p className="text-purple-600 text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase mb-4 mt-2">Technology • Product • Innovation</p>
            <p className="text-slate-600 text-sm leading-relaxed">
              Leading the technical vision, building robust architectures, and driving product innovation to power the WeColax platform.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="relative w-full max-w-4xl rounded-2xl overflow-hidden shadow-xl border border-slate-200">
            <img 
              src="/wecolax-family.png" 
              alt="We are Wecolax family" 
              className="w-full h-auto block"
            />
          </div>
        </div>
      </section>

    </div>
  );
}
