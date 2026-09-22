'use client';

import { useState } from 'react';
import { Pencil, Loader2, X, Check } from 'lucide-react';
import { updateDocAction } from '@/app/actions/docs';

export function EditDocButton({ docId, currentContent }: { docId: string; currentContent: string }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(currentContent);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (value === currentContent) {
      setEditing(false);
      return;
    }
    setLoading(true);
    const res = await updateDocAction(docId, value);
    setLoading(false);
    if (res.success) {
      setEditing(false);
    }
  };

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="p-1.5 sm:p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all active:scale-95 cursor-pointer"
        title="Edit"
      >
        <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>
    );
  }

  return (
    <div className="mt-3">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={3}
        className="w-full bg-white border border-blue-300 rounded-xl p-3 text-xs sm:text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all resize-y shadow-sm"
      />
      <div className="flex gap-2 mt-2 justify-end">
        <button
          onClick={() => { setEditing(false); setValue(currentContent); }}
          disabled={loading}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
        >
          <X className="w-3.5 h-3.5" /> Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all active:scale-95 shadow-sm shadow-blue-600/20 cursor-pointer disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          Save
        </button>
      </div>
    </div>
  );
}
