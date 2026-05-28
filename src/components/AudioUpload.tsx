import { useRef, useState } from 'react';
import { Music2, Upload, X, Link } from 'lucide-react';
import { api } from '../lib/api';

interface Props {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function AudioUpload({ value, onChange, label = 'Audio File' }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    if (!file.type.startsWith('audio/')) {
      setError('Only audio files are allowed (MP3, WAV, AAC, FLAC)');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const url = await api.uploadAudio(file);
      onChange(url);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) upload(file);
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">{label}</label>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-5 text-center transition-all ${
          dragging ? 'border-[#0d9488] bg-[#0d9488]/5 scale-[1.01]' : 'border-gray-200 hover:border-[#0d9488]/40'
        }`}
      >
        {value ? (
          <div className="space-y-3">
            <audio controls src={value} className="w-full rounded-lg" />
            <button
              type="button"
              onClick={() => onChange('')}
              className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1 mx-auto transition-colors"
            >
              <X size={12} /> Remove audio
            </button>
          </div>
        ) : uploading ? (
          <div className="py-4 flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-[#0d9488]/30 border-t-[#0d9488] rounded-full animate-spin" />
            <p className="text-sm text-[#64748b]">Uploading audio...</p>
          </div>
        ) : (
          <div className="py-4 flex flex-col items-center gap-2">
            <Music2 size={32} className={`transition-colors ${dragging ? 'text-[#0d9488]' : 'text-gray-300'}`} />
            <p className="text-sm font-medium text-[#64748b]">
              {dragging ? 'Drop audio file here' : 'Drag & drop audio file here'}
            </p>
            <p className="text-xs text-gray-400">MP3, WAV, AAC, FLAC — up to 50 MB</p>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 mt-2 flex-wrap">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#0d9488] border border-[#0d9488]/30 rounded-lg hover:bg-[#0d9488]/10 transition-colors disabled:opacity-50"
        >
          <Upload size={12} />
          Upload from Device
        </button>
        <button
          type="button"
          onClick={() => setShowUrl(!showUrl)}
          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#64748b] border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Link size={12} />
          Paste URL
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ''; }}
        />
      </div>

      {/* URL input (toggled) */}
      {showUrl && (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://cdn.example.com/track.mp3"
          className="mt-2 w-full px-3 py-2 text-sm rounded-xl border-2 border-gray-200 focus:border-[#0d9488] focus:outline-none transition-all"
        />
      )}

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
