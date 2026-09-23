'use client';

import { useActionState, useEffect, useRef } from 'react';
import { updatePasswordAction } from './actions';
import { KeyRound } from 'lucide-react';

export function UpdatePasswordForm() {
  const [state, formAction, isPending] = useActionState(updatePasswordAction, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 h-fit">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-slate-900">
        <KeyRound className="w-5 h-5 text-purple-600" /> Change Your Password
      </h2>
      <form ref={formRef} action={formAction} className="space-y-4">
        {state?.error && (
          <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm animate-in fade-in slide-in-from-top-2">
            {state.error}
          </div>
        )}
        {state?.success && (
          <div className="p-3 bg-green-50 text-green-600 border border-green-200 rounded-xl text-sm animate-in fade-in slide-in-from-top-2">
            Password updated successfully
          </div>
        )}
        <input 
          type="password" 
          name="currentPassword"
          placeholder="Current Password" 
          required 
          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-sm" 
        />
        <input 
          type="password" 
          name="newPassword"
          placeholder="New Password" 
          required 
          minLength={8}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-sm" 
        />
        <button 
          type="submit" 
          disabled={isPending}
          className="px-4 py-2 bg-purple-600 rounded-lg text-white font-medium hover:bg-purple-700 shadow-md shadow-purple-600/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}
