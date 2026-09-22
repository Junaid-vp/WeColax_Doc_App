'use client';

import { useState } from 'react';
import { revokeSessionAction } from '@/app/actions/session';
import { Trash2, Loader2 } from 'lucide-react';

export function RevokeSessionButton({ sessionId }: { sessionId: string }) {
  const [loading, setLoading] = useState(false);

  const handleRevoke = async () => {
    setLoading(true);
    await revokeSessionAction(sessionId);
    setLoading(false);
  };

  return (
    <button
      onClick={handleRevoke}
      disabled={loading}
      className="p-2 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors disabled:opacity-50"
      title="Force Logout"
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
    </button>
  );
}
