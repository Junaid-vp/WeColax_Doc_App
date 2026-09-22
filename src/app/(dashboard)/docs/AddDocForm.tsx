'use client';

import { useState } from 'react';
import { addDocAction, addBulkDocsAction } from '@/app/actions/docs';
import { Loader2, Plus, Lock, FileJson, Upload } from 'lucide-react';

export function AddDocForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'single' | 'bulk'>('single');
  const [envInputMode, setEnvInputMode] = useState<'paste' | 'manual'>('paste');
  const [manualEnv, setManualEnv] = useState<{key: string, value: string}[]>([{key: '', value: ''}]);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [bulkContent, setBulkContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        setContent(evt.target.result as string);
      }
    };
    reader.readAsText(file);
  };

  const handleSubmitSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await addDocAction(title, content);
    if (res.success) {
      setIsOpen(false);
      setTitle('');
      setContent('');
    } else {
      alert(res.error);
    }
    setLoading(false);
  };

  const parseBulkInput = (input: string): { title: string; content: string }[] => {
    const docs: { title: string; content: string }[] = [];
    
    try {
      const parsed = JSON.parse(input);
      if (typeof parsed === 'object' && parsed !== null) {
        Object.entries(parsed).forEach(([key, value]) => {
          docs.push({ title: key, content: String(value) });
        });
        return docs;
      }
    } catch (e) {}

    const lines = input.split('\n');
    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      
      const equalIdx = trimmed.indexOf('=');
      if (equalIdx > 0) {
        const key = trimmed.substring(0, equalIdx).trim();
        let value = trimmed.substring(equalIdx + 1).trim();
        
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.substring(1, value.length - 1);
        }
        docs.push({ title: key, content: value });
      }
    });

    return docs;
  };

  const handleSubmitBulk = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    let docsToInsert: { title: string; content: string }[] = [];
    
    if (envInputMode === 'paste') {
      docsToInsert = parseBulkInput(bulkContent);
    } else {
      docsToInsert = manualEnv
        .filter(item => item.key.trim() !== '')
        .map(item => ({ title: item.key.trim(), content: item.value }));
    }
    
    if (docsToInsert.length === 0) {
      alert("Could not parse any valid documents from the input.");
      setLoading(false);
      return;
    }

    const res = await addBulkDocsAction(docsToInsert);
    if (res.success) {
      setIsOpen(false);
      setBulkContent('');
      setManualEnv([{key: '', value: ''}]);
    } else {
      alert(res.error);
    }
    setLoading(false);
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => {
            setMode('bulk');
            setIsOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl font-medium transition-colors shadow-sm"
        >
          <FileJson className="w-4 h-4" /> Add Secure Env
        </button>
        
        <button
          onClick={() => {
            setMode('single');
            setIsOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-xl text-white font-medium transition-colors shadow-md shadow-purple-600/20"
        >
          <Plus className="w-5 h-5" /> Add Secure Doc
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold flex items-center gap-2 text-lg text-slate-900">
                <Lock className="w-5 h-5 text-purple-600" /> 
                {mode === 'single' ? 'Encrypt New Document' : 'Encrypt Environment Variables'}
              </h3>
            </div>

            {mode === 'single' ? (
              <form onSubmit={handleSubmitSingle} className="space-y-4">
                <input
                  required
                  placeholder="Document Title (e.g. Terms & Conditions)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 shadow-sm transition-all"
                />
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm text-slate-700 font-medium">Content</label>
                    <label className="text-xs text-purple-600 hover:text-purple-700 cursor-pointer flex items-center gap-1 font-medium bg-purple-50 px-2 py-1 rounded-md border border-purple-100">
                      <Upload className="w-3 h-3" /> Upload File
                      <input type="file" accept=".txt,.md,.json,.csv" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>
                  <textarea
                    required
                    rows={6}
                    placeholder="Write content manually or upload a text file above..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-sm font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 shadow-sm transition-all"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-800 font-medium transition-colors">
                    Cancel
                  </button>
                  <button disabled={loading} type="submit" className="px-4 py-2 bg-purple-600 rounded-lg text-sm text-white font-medium flex items-center gap-2 shadow-md shadow-purple-600/20 hover:bg-purple-700 transition-all">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Encrypt & Save'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmitBulk} className="space-y-4">
                <div className="flex gap-2 p-1 bg-slate-100 rounded-lg w-fit border border-slate-200">
                   <button type="button" onClick={() => setEnvInputMode('paste')} className={`px-3 py-1 text-sm rounded font-medium transition-colors ${envInputMode === 'paste' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Paste Full (.env / JSON)</button>
                   <button type="button" onClick={() => setEnvInputMode('manual')} className={`px-3 py-1 text-sm rounded font-medium transition-colors ${envInputMode === 'manual' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Manual Input</button>
                </div>
                
                {envInputMode === 'paste' ? (
                  <textarea
                    required
                    rows={8}
                    placeholder={`Paste full .env or JSON...\n\nAPI_KEY=123\nDB_PASS="secret"\n\n-- OR --\n\n{\n  "API_KEY": "123",\n  "DB_PASS": "secret"\n}`}
                    value={bulkContent}
                    onChange={(e) => setBulkContent(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-sm font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 shadow-sm transition-all"
                  />
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                    {manualEnv.map((item, idx) => (
                       <div key={idx} className="flex gap-2">
                         <input placeholder="KEY" value={item.key} onChange={e => {
                           const newEnv = [...manualEnv]; newEnv[idx].key = e.target.value; setManualEnv(newEnv);
                         }} className="flex-1 bg-white border border-slate-200 rounded-xl py-2 px-3 text-sm font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 shadow-sm transition-all" />
                         <input placeholder="VALUE" value={item.value} onChange={e => {
                           const newEnv = [...manualEnv]; newEnv[idx].value = e.target.value; setManualEnv(newEnv);
                         }} className="flex-1 bg-white border border-slate-200 rounded-xl py-2 px-3 text-sm font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 shadow-sm transition-all" />
                         <button type="button" onClick={() => {
                            const newEnv = manualEnv.filter((_, i) => i !== idx);
                            setManualEnv(newEnv.length ? newEnv : [{key:'', value:''}]);
                         }} className="px-2 text-red-500 hover:bg-red-50 rounded-xl font-bold transition-colors">✕</button>
                       </div>
                    ))}
                    <button type="button" onClick={() => setManualEnv([...manualEnv, {key:'', value:''}])} className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1 mt-2 transition-colors">
                      <Plus className="w-4 h-4"/> Add Row
                    </button>
                  </div>
                )}
                
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-800 font-medium transition-colors">
                    Cancel
                  </button>
                  <button disabled={loading} type="submit" className="px-4 py-2 bg-blue-600 rounded-lg text-sm text-white font-medium flex items-center gap-2 shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-all">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Bulk Encrypt'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
