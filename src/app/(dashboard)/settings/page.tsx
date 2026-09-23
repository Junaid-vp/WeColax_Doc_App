import { Settings as SettingsIcon, KeyRound, MonitorSmartphone, Clock, ShieldCheck, Globe, Fingerprint, ScanFace } from 'lucide-react';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { RevokeSessionButton } from '../RevokeSessionButton';
import { formatDistanceToNow } from 'date-fns';
import { BiometricSetupButton } from './BiometricSetupButton';
import { InstallAppButton } from './InstallAppButton';
import { UpdatePasswordForm } from './UpdatePasswordForm';



export default async function SettingsPage() {
  const currentSession = await getSession();
  if (!currentSession) return null;

  const [user, activeSessions, recentAudits] = await Promise.all([
    // Query 1: Get User details
    prisma.user.findUnique({
      where: { id: currentSession.userId },
      include: { authenticators: true }
    }),
    
    // Query 2: Get active sessions
    prisma.session.findMany({
      where: { userId: currentSession.userId },
      orderBy: { lastActiveAt: 'desc' }
    }),

    // Query 3: Get audit logs
    prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { user: true }
    })
  ]);

  const hasPasskeys = (user?.authenticators?.length ?? 0) > 0;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-700">
      <header className="pb-4 sm:pb-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 sm:gap-3 text-slate-900">
            <SettingsIcon className="w-6 h-6 sm:w-8 sm:h-8 text-slate-500 shrink-0" /> Settings
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-2">Manage your account preferences and security for <strong className="text-slate-700">{currentSession.user.role}</strong>.</p>
        </div>
        <InstallAppButton />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Password Reset */}
        <UpdatePasswordForm />

        {/* Biometric Security */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 h-fit">
           <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-slate-900">
             <Fingerprint className="w-5 h-5 text-blue-600" /> Biometric Authentication
           </h2>
           <p className="text-sm text-slate-500 mb-6 leading-relaxed">
             Enable Face ID, Touch ID, or Windows Hello for faster and passwordless access to the Executive Vault.
           </p>
           
           <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl shadow-inner">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <ScanFace className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Passkeys Configuration</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{hasPasskeys ? '1 passkey active' : 'Not enabled'}</p>
                </div>
             </div>
             <BiometricSetupButton hasPasskeys={hasPasskeys} />
           </div>
        </div>

        {/* Active Sessions */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6">
           <div className="flex justify-between items-center mb-6">
             <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-900">
               <ShieldCheck className="w-5 h-5 text-green-600" /> Active Sessions
             </h2>
             <span className="text-sm px-2 py-1 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 font-medium">
               {activeSessions.length} Devices Logged In
             </span>
           </div>

           <div className="space-y-4">
             {activeSessions.map((session) => {
               const isCurrent = session.id === currentSession.id;
               
               return (
                 <div key={session.id} className={`p-4 rounded-2xl border ${isCurrent ? 'bg-purple-50 border-purple-200 shadow-sm' : 'bg-slate-50 border-slate-200'} flex items-start justify-between gap-4`}>
                   <div className="flex gap-4">
                     <div className="mt-1">
                       <MonitorSmartphone className={`w-6 h-6 ${isCurrent ? 'text-purple-600' : 'text-slate-400'}`} />
                     </div>
                     <div>
                       <div className="font-medium flex items-center gap-2 text-slate-900">
                         {session.deviceInfo || 'Unknown Device'}
                         {isCurrent && (
                           <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full font-semibold shadow-sm">
                             Current Device
                           </span>
                         )}
                       </div>
                       <div className="text-sm text-slate-500 mt-1 flex flex-col sm:flex-row gap-1 sm:gap-4">
                         <span className="flex items-center gap-1">
                           <Globe className="w-3.5 h-3.5" /> {session.ipAddress || 'Unknown IP'}
                         </span>
                         <span className="flex items-center gap-1">
                           <Clock className="w-3.5 h-3.5" /> 
                           {isCurrent ? 'Online Now' : `Last seen ${formatDistanceToNow(session.lastActiveAt, { addSuffix: true })}`}
                         </span>
                       </div>
                     </div>
                   </div>
                   
                   {!isCurrent && (
                     <RevokeSessionButton sessionId={session.id} />
                   )}
                 </div>
               );
             })}
           </div>
        </div>

      {/* Audit Logs Widget */}
      <section className="bg-white/80 border border-slate-200 shadow-sm rounded-3xl p-6 backdrop-blur-xl">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-3 text-slate-900">
          <span className="p-2 bg-blue-50 border border-blue-100 rounded-xl text-blue-600 shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </span>
          Recent Audit Logs
        </h2>
        
        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
          {recentAudits.map((log) => (
            <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 bg-white text-slate-400 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm text-purple-600">{log.user?.role || 'System'}</span>
                  <span className="text-xs text-slate-400">{formatDistanceToNow(log.createdAt, { addSuffix: true })}</span>
                </div>
                <p className="text-sm text-slate-600">{log.action}</p>
              </div>
            </div>
          ))}
          {recentAudits.length === 0 && (
            <p className="text-center text-slate-500 text-sm py-4">No recent activity found.</p>
          )}
        </div>
      </section>
      </div>

    </div>
  );
}
