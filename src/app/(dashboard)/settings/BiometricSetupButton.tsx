'use client';

import { useState } from 'react';
import { startRegistration } from '@simplewebauthn/browser';
import { getRegistrationOptionsAction, verifyRegistrationAction } from '@/app/actions/webauthn';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function BiometricSetupButton({ hasPasskeys }: { hasPasskeys: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSetup = async () => {
    try {
      setLoading(true);
      
      // 1. Get options from server
      const options = await getRegistrationOptionsAction();

      // 2. Pass options to browser to trigger Face ID / Touch ID
      let authResponse;
      try {
        authResponse = await startRegistration(options);
      } catch (error: any) {
        if (error.name === 'NotAllowedError') {
          alert('Registration cancelled or not allowed.');
        } else {
          alert('Error during registration: ' + error.message);
        }
        setLoading(false);
        return;
      }

      // 3. Send response back to server for verification
      const verificationResp = await verifyRegistrationAction(authResponse);

      if (verificationResp.success) {
        alert('Biometric authentication setup successfully!');
        router.refresh();
      } else {
        alert('Verification failed: ' + verificationResp.error);
      }
    } catch (err: any) {
      console.error(err);
      alert('Failed to setup biometric authentication. ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (hasPasskeys) {
    return (
      <button 
        disabled
        className="bg-green-50 text-green-700 px-4 py-2 rounded-xl text-sm font-semibold border border-green-200 cursor-default shadow-sm"
      >
        Enabled
      </button>
    );
  }

  return (
    <button 
      type="button" 
      onClick={handleSetup}
      disabled={loading}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-md shadow-blue-600/20 hover:scale-105 active:scale-95 flex items-center justify-center min-w-[80px] disabled:opacity-70 disabled:hover:scale-100 disabled:active:scale-100"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : 'Setup'}
    </button>
  );
}
