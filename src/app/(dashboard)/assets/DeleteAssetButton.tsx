'use client';

import { useState } from 'react';
import { deleteAssetAction } from '@/app/actions/assets';
import { Trash2, Loader2 } from 'lucide-react';

export function DeleteAssetButton({ assetId }: { assetId: string }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to permanently delete this asset?')) return;
    setLoading(true);
    await deleteAssetAction(assetId);
    setLoading(false);
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-2 rounded-xl bg-white shadow-md border border-red-100 text-red-600 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50 absolute top-6 right-6 sm:top-4 sm:right-4 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 z-10"
      title="Delete Asset"
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
    </button>
  );
}
