'use client';

import { useState } from 'react';
import { addInfluencerAction } from '@/app/actions/influencer';
import { Plus, Loader2 } from 'lucide-react';

export function AddInfluencerForm() {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    await addInfluencerAction(formData);
    setLoading(false);
    setOpen(false);
  };

  return (
    <>
      <button 
        onClick={() => setOpen(true)}
        className="bg-pink-600 hover:bg-pink-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all font-medium text-sm shadow-md shadow-pink-600/20 hover:shadow-lg active:scale-95"
      >
        <Plus className="w-4 h-4" /> Add Campaign
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setOpen(false)} />
          
          <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-2xl relative overflow-hidden w-full max-w-lg z-10 animate-in zoom-in-95 duration-200">
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-100 blur-[40px] pointer-events-none" />
            
            <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-pink-600">New Influencer Campaign</h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Influencer Name</label>
              <input 
                type="text" 
                name="name" 
                required 
                className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 shadow-sm transition-all"
                placeholder="e.g. Marques Brownlee"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Campaign Details</label>
              <textarea 
                name="details" 
                rows={3}
                className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 shadow-sm transition-all resize-none"
                placeholder="What is this campaign about?"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Video Links <span className="text-slate-400 text-xs font-normal">(comma separated)</span></label>
              <input 
                type="text" 
                name="videoLinks" 
                className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 shadow-sm transition-all"
                placeholder="https://youtube.com/..., https://tiktok.com/..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button 
                type="button" 
                onClick={() => setOpen(false)}
                className="px-5 py-2.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all font-medium text-sm disabled:opacity-50 active:scale-95 shadow-md shadow-pink-600/20"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Campaign'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
