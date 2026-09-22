'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export function RevealContent({ content }: { content: string }) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <div className="flex justify-end mb-2">
        <button
          onClick={() => setVisible(!visible)}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all active:scale-95 cursor-pointer
            ${visible 
              ? 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100' 
              : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
            }"
        >
          {visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          {visible ? 'Hide' : 'Reveal'}
        </button>
      </div>
      
      <pre className="bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono text-slate-700 overflow-x-auto shadow-inner whitespace-pre-wrap break-all select-none">
        <code className={visible ? '' : 'blur-sm select-none pointer-events-none transition-all'}>
          {content}
        </code>
      </pre>
    </div>
  );
}
