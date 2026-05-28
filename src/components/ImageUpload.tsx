import { useRef, useState } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';
import { api } from '../lib/api';

interface Props {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
}

export default function ImageUpload({ value, onChange, label = 'Image', placeholder = '/images/photo.jpg or paste URL' }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const url = await api.uploadImage(file);
      onChange(url);
    } catch (err) {
      setError((err as Error).message || 'Upload failed');
    } finally {
      setUploading(false);
      // Reset input so same file can be re-selected
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">{label}</label>

      {/* Preview */}
      {value ? (
        <div className="relative w-full h-44 rounded-xl overflow-hidden mb-2 bg-gray-100 border-2 border-gray-200">
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors"
            title="Remove image"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="w-full h-44 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center mb-2 bg-[#f8fafc] text-[#64748b]">
          <ImageIcon size={32} className="mb-2 opacity-40" />
          <span className="text-sm opacity-60">No image selected</span>
        </div>
      )}

      {/* Upload button */}
      <label className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border-2 border-dashed cursor-pointer text-sm font-semibold transition-all mb-2
        ${uploading
          ? 'border-[#0d9488]/40 text-[#0d9488]/60 bg-[#0d9488]/5 cursor-not-allowed'
          : 'border-[#0d9488]/40 text-[#0d9488] hover:bg-[#0d9488]/5 hover:border-[#0d9488]'
        }`}>
        {uploading ? (
          <><div className="w-4 h-4 border-2 border-[#0d9488]/30 border-t-[#0d9488] rounded-full animate-spin" /> Uploading...</>
        ) : (
          <><Upload size={16} /> Upload from Device</>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          disabled={uploading}
          className="hidden"
        />
      </label>

      {/* URL fallback input */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#0d9488] focus:outline-none text-sm transition-all"
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
