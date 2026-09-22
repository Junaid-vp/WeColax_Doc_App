'use client';

import { useState } from 'react';
import { deleteDocAction } from '@/app/actions/docs';
import { Trash2, Loader2 } from 'lucide-react';

export function DeleteDocButton({ docId }: { docId: string }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to permanently delete this secure document?')) return;
    setLoading(true);
    await deleteDocAction(docId);
    setLoading(false);
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
      title="Delete Document"
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
    </button>
  );
}
