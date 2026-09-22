import { ProjectDoc } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { decryptData } from '@/lib/encryption';
import { ShieldCheck, FileText, Lock } from 'lucide-react';
import { CopyButton } from './CopyButton';
import { AddDocForm } from './AddDocForm';
import { DeleteDocButton } from './DeleteDocButton';


export const dynamic = 'force-dynamic';

export default async function DocsVaultPage() {
  const docs = await prisma.projectDoc.findMany({ orderBy: { title: 'asc' } });

  // Decrypt them securely on the server
  const decryptedDocs = docs.map((doc: ProjectDoc) => {
    let rawContent = "Error decrypting - Master Key might be incorrect or missing.";
    try {
      rawContent = decryptData(doc.encryptedContent, doc.iv);
    } catch(e) {}
    
    return {
      id: doc.id,
      title: doc.title,
      content: rawContent
    };
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="pb-6 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900">
            <Lock className="w-8 h-8 text-purple-600" /> Secure Docs Vault
          </h1>
          <p className="text-slate-500 mt-2">Environment variables and architecture notes are encrypted with AES-256 in the database.</p>
        </div>
        <AddDocForm />
      </header>

      <div className="grid grid-cols-1 gap-6">
        {decryptedDocs.map((doc: { id: string; title: string; content: string }) => (
          <div key={doc.id} className="bg-white/70 border border-slate-200 rounded-2xl p-6 relative group overflow-hidden shadow-sm backdrop-blur-xl">
             <div className="flex justify-between items-center mb-4">
               <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-900">
                 <FileText className="w-5 h-5 text-blue-600" /> {doc.title}
               </h2>
               <div className="flex items-center gap-2">
                 <CopyButton content={doc.content} />
                 <DeleteDocButton docId={doc.id} />
               </div>
             </div>
             
             <pre className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm font-mono text-slate-700 overflow-x-auto shadow-inner">
               <code>{doc.content}</code>
             </pre>
          </div>
        ))}

        {decryptedDocs.length === 0 && (
          <div className="text-center p-12 bg-white/50 border border-slate-200 rounded-3xl border-dashed shadow-sm">
            <ShieldCheck className="w-12 h-12 text-slate-400 mx-auto mb-4 opacity-50" />
            <p className="text-slate-500">The vault is currently empty.</p>
          </div>
        )}
      </div>
    </div>
  )
}
