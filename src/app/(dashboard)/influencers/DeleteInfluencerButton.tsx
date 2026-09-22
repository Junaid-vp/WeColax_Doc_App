'use client';

import { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { deleteInfluencerAction } from '@/app/actions/influencer';

export function DeleteInfluencerButton({ influencerId }: { influencerId: string }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Delete this influencer?')) return;
    setLoading(true);
    await deleteInfluencerAction(influencerId);
    setLoading(false);
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-1.5 rounded-lg bg-red-50 border border-red-200 text-red-500 hover:text-red-700 hover:bg-red-100 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
      title="Delete"
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
    </button>
  );
}
