'use client';

import { useState, useRef } from 'react';
import { CldUploadWidget } from 'next-cloudinary';
import { UploadCloud, X } from 'lucide-react';
import { saveAssetAction } from '@/app/actions/assets';

export function UploadAssetButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  
  // Use a ref so the Cloudinary onSuccess callback always has the latest title
  const titleRef = useRef(title);
  titleRef.current = title;

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-medium transition-all shadow-md shadow-blue-600/20 active:scale-95"
      >
        <UploadCloud className="w-5 h-5" /> Upload HD File
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setIsModalOpen(false)} />
          
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-2xl relative overflow-hidden w-full max-w-md z-10 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold text-slate-900">Upload Asset</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Asset Title</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                placeholder="e.g. Summer Campaign Video"
                autoFocus
              />
            </div>

            <div className="pt-2">
              <CldUploadWidget 
                uploadPreset="wecolax_preset" 
                options={{ multiple: false, maxFiles: 1 }}
                onSuccess={async (result: any) => {
                  if (result?.info) {
                    const info = result.info;
                    const url = info.secure_url;
                    const format = info.format || 'unknown';
                    const size = info.bytes || 0;
                    
                    // Use the custom title, fallback to original filename if left blank
                    const finalTitle = titleRef.current.trim() || info.original_filename || 'Uploaded File';
                    
                    await saveAssetAction(finalTitle, url, format, size);
                    setIsModalOpen(false);
                    setTitle(''); // Reset for next time
                  }
                }}
              >
                {({ open }) => (
                  <button 
                    onClick={() => open()}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-semibold transition-all shadow-md shadow-blue-600/20 active:scale-95"
                  >
                    Select File & Upload
                  </button>
                )}
              </CldUploadWidget>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
