import { Users, Link as LinkIcon, Calendar } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { AddInfluencerForm } from './AddInfluencerForm';
import { DeleteInfluencerButton } from './DeleteInfluencerButton';
import { formatDistanceToNow } from 'date-fns';



export const dynamic = 'force-dynamic';

export default async function InfluencersPage() {
  const influencers = await prisma.influencer.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-700">
      <header className="pb-4 sm:pb-6 border-b border-slate-200 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 sm:gap-3 text-slate-900">
            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-pink-600 shrink-0" /> Influencer Tracking
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-2">Track promotion campaigns, details, and video links.</p>
        </div>
        <AddInfluencerForm />
      </header>

      {influencers.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-sm">
          <p className="text-slate-500 text-center py-12">No active influencer campaigns tracked yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {influencers.map(inf => (
            <div key={inf.id} className="bg-white border border-slate-200 rounded-3xl p-6 hover:shadow-md transition-shadow group shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-pink-600 transition-colors">{inf.name}</h3>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                    <Calendar className="w-3 h-3" />
                    {formatDistanceToNow(inf.createdAt, { addSuffix: true })}
                  </span>
                  <DeleteInfluencerButton influencerId={inf.id} />
                </div>
              </div>
              
              {inf.details && (
                <p className="text-slate-600 text-sm mb-4 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-inner">
                  {inf.details}
                </p>
              )}
              
              {inf.videoLinks.length > 0 && (
                <div className="space-y-2 mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Deliverables ({inf.videoLinks.length})</p>
                  {inf.videoLinks.map((link, idx) => (
                    <a 
                      key={idx} 
                      href={link.startsWith('http') ? link : `https://${link}`}
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center gap-2 text-sm text-pink-600 hover:text-pink-700 bg-pink-50 hover:bg-pink-100 px-3 py-2.5 rounded-xl transition-all border border-pink-200 shadow-sm active:scale-95"
                    >
                      <LinkIcon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{link}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
