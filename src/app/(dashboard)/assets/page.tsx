import { prisma } from '@/lib/prisma';
import { ImageIcon, Download, UploadCloud, Video, FileText, File, Eye } from 'lucide-react';
import { UploadAssetButton } from './UploadAssetButton';
import { DeleteAssetButton } from './DeleteAssetButton';


export const dynamic = 'force-dynamic';

const imageFormats = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'heic', 'image'];
const videoFormats = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'video'];

function getFileIcon(type: string | null) {
  if (!type) return <File className="w-12 h-12 text-slate-400" />;
  
  const lowerType = type.toLowerCase();
  if (videoFormats.some(ext => lowerType.includes(ext))) return <Video className="w-12 h-12 text-blue-600" />;
  if (imageFormats.some(ext => lowerType.includes(ext))) return <ImageIcon className="w-12 h-12 text-purple-600" />;
  
  return <FileText className="w-12 h-12 text-slate-400" />;
}

export default async function AssetsPage() {
  const assets = await prisma.brandAsset.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-700">
      <header className="pb-4 sm:pb-6 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 sm:gap-3 text-slate-900">
            <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 shrink-0" /> Brand Assets
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-2">Upload and manage large HD images and promotional videos via Cloudinary.</p>
        </div>
        <UploadAssetButton />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assets.map(asset => {
          const sizeMb = asset.sizeBytes ? (asset.sizeBytes / (1024 * 1024)).toFixed(2) : '0';
          const lowerType = (asset.fileType || '').toLowerCase();
          const isImage = imageFormats.some(ext => lowerType.includes(ext));
          const isPdf = lowerType.includes('pdf');
          
          // Cloudinary restricts inline PDF viewing by default (returns 401), causing "Failed to load PDF" in browsers.
          // By changing the extension to .jpg, Cloudinary serves a high-quality image of the first page.
          const viewUrl = isPdf ? asset.cloudStorageUrl.replace(/\.pdf$/i, '.jpg') : asset.cloudStorageUrl;
          
          return (
            <div key={asset.id} className="bg-white border border-slate-200 rounded-2xl p-4 group relative shadow-sm hover:shadow-md transition-shadow">
              <DeleteAssetButton assetId={asset.id} />
              
              <div className="aspect-video bg-slate-100 rounded-xl mb-4 flex items-center justify-center overflow-hidden relative border border-slate-100">
                {isImage ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={asset.cloudStorageUrl} alt={asset.title} className="w-full h-full object-cover group-hover:opacity-40 transition-opacity" />
                ) : (
                  getFileIcon(asset.fileType)
                )}
                
                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                  <a 
                    href={viewUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-white text-slate-900 font-semibold rounded-lg hover:scale-105 transition-transform shadow-md"
                  >
                    <Eye className="w-4 h-4" /> View
                  </a>
                  <a 
                    href={asset.cloudStorageUrl.replace('/upload/', '/upload/fl_attachment/')} 
                    download
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:scale-105 transition-transform shadow-md"
                  >
                    <Download className="w-4 h-4" /> Download
                  </a>
                </div>
              </div>
              <h3 className="font-medium text-lg truncate text-slate-900" title={asset.title}>{asset.title}</h3>
              <p className="text-sm text-slate-500 flex justify-between mt-1">
                <span>{asset.fileType || 'Unknown'} • {sizeMb} MB</span>
                <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-medium border border-slate-200">By {asset.uploadedBy}</span>
              </p>
            </div>
          );
        })}

        {assets.length === 0 && (
          <div className="col-span-full text-center p-12 bg-slate-50 border border-slate-200 rounded-3xl border-dashed shadow-sm">
            <UploadCloud className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No assets uploaded yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
