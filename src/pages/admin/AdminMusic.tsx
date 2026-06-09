import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Star, Music, Disc3, ExternalLink, X, Check } from 'lucide-react';
import { api } from '../../lib/api';
import ImageUpload from '../../components/ImageUpload';
import AudioUpload from '../../components/AudioUpload';
import { useDialog } from '../../context/DialogContext';

interface Track { id: number; title: string; album: string; duration: string; cover: string; audioUrl: string; featured: boolean; playCount: number; downloadCount: number; order: number; }
interface Album { id: number; title: string; year: string; type: string; cover: string; trackCount: number; description: string; }
interface StreamingLink { id: number; platform: string; url: string; active: boolean; }

const emptyTrack: Omit<Track, 'id' | 'playCount' | 'downloadCount'> = { title: '', album: '', duration: '', cover: '', audioUrl: '', featured: false, order: 0 };
const emptyAlbum: Omit<Album, 'id'> = { title: '', year: '', type: 'Album', cover: '', trackCount: 0, description: '' };

export default function AdminMusic() {
  const dialog = useDialog();
  const [tab, setTab] = useState<'tracks' | 'albums' | 'streaming'>('tracks');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [links, setLinks] = useState<StreamingLink[]>([]);
  const [trackModal, setTrackModal] = useState<{ open: boolean; data: Partial<Track> }>({ open: false, data: {} });
  const [albumModal, setAlbumModal] = useState<{ open: boolean; data: Partial<Album> }>({ open: false, data: {} });
  const [saving, setSaving] = useState(false);

  const load = () => {
    api.getTracks().then(setTracks).catch(console.error);
    api.getAlbums().then(setAlbums).catch(console.error);
    api.getStreamingLinks().then(setLinks).catch(console.error);
  };
  useEffect(load, []);

  const saveTrack = async () => {
    setSaving(true);
    try {
      if (trackModal.data.id) await api.updateTrack(trackModal.data.id, trackModal.data);
      else await api.createTrack(trackModal.data);
      setTrackModal({ open: false, data: {} });
      load();
    } catch (e) { await dialog.alert((e as Error).message, { variant: 'danger' }); }
    finally { setSaving(false); }
  };

  const deleteTrack = async (id: number) => {
    if (!(await dialog.confirm('Delete this track?', { variant: 'danger', confirmText: 'Delete' }))) return;
    await api.deleteTrack(id); load();
  };

  const saveAlbum = async () => {
    setSaving(true);
    try {
      if (albumModal.data.id) await api.updateAlbum(albumModal.data.id, albumModal.data);
      else await api.createAlbum(albumModal.data);
      setAlbumModal({ open: false, data: {} });
      load();
    } catch (e) { await dialog.alert((e as Error).message, { variant: 'danger' }); }
    finally { setSaving(false); }
  };

  const deleteAlbum = async (id: number) => {
    if (!(await dialog.confirm('Delete this album?', { variant: 'danger', confirmText: 'Delete' }))) return;
    await api.deleteAlbum(id); load();
  };

  const updateLink = async (id: number, url: string) => {
    await api.updateStreamingLink(id, { url }); load();
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2">
        {(['tracks', 'albums', 'streaming'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm capitalize transition-all ${tab === t ? 'bg-[#0d9488] text-white shadow-lg shadow-[#0d9488]/20' : 'bg-white text-[#64748b] hover:bg-[#0d9488]/10 hover:text-[#0d9488] border border-gray-200'}`}>
            {t === 'streaming' ? 'Streaming Links' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* TRACKS */}
      {tab === 'tracks' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-[#0f172a] flex items-center gap-2"><Music size={18} className="text-[#0d9488]" /> Tracks ({tracks.length})</h3>
            <button onClick={() => setTrackModal({ open: true, data: { ...emptyTrack } })}
              className="flex items-center gap-2 bg-[#0d9488] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#0f766e] transition-colors">
              <Plus size={16} /> Add Track
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-gray-100 text-left">
                {['#', 'Title', 'Album', 'Duration', 'Plays', 'Downloads', 'Featured', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wide">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {tracks.map((t, i) => (
                  <tr key={t.id} className="hover:bg-[#f8fafc] transition-colors">
                    <td className="px-4 py-3 text-sm text-[#64748b]">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={t.cover} alt={t.title} className="w-10 h-10 rounded-lg object-cover bg-gray-100" onError={(e) => { (e.target as HTMLImageElement).src = '/images/album-daily-miracles.jpg'; }} />
                        <span className="font-semibold text-sm text-[#0f172a]">{t.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#64748b]">{t.album}</td>
                    <td className="px-4 py-3 text-sm text-[#64748b]">{t.duration}</td>
                    <td className="px-4 py-3 text-sm text-[#0d9488] font-semibold">{t.playCount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-[#64748b]">{t.downloadCount.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => api.updateTrack(t.id, { featured: !t.featured }).then(load)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${t.featured ? 'bg-[#0d9488] text-white' : 'bg-gray-100 text-gray-400 hover:bg-[#0d9488]/20'}`}>
                        <Star size={14} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => setTrackModal({ open: true, data: t })}
                          className="p-2 text-[#64748b] hover:text-[#0d9488] hover:bg-[#0d9488]/10 rounded-lg transition-colors"><Edit2 size={15} /></button>
                        <button onClick={() => deleteTrack(t.id)}
                          className="p-2 text-[#64748b] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ALBUMS */}
      {tab === 'albums' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-[#0f172a] flex items-center gap-2"><Disc3 size={18} className="text-[#0d9488]" /> Albums & EPs ({albums.length})</h3>
            <button onClick={() => setAlbumModal({ open: true, data: { ...emptyAlbum } })}
              className="flex items-center gap-2 bg-[#0d9488] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#0f766e] transition-colors">
              <Plus size={16} /> Add Album
            </button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {albums.map((a) => (
              <div key={a.id} className="border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative h-40 bg-gray-100">
                  <img src={a.cover} alt={a.title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = '/images/album-daily-miracles.jpg'; }} />
                  <span className="absolute top-2 right-2 bg-white/90 text-[#0d9488] text-xs font-bold px-2 py-0.5 rounded-full">{a.type}</span>
                </div>
                <div className="p-4">
                  <div className="font-bold text-[#0f172a]">{a.title}</div>
                  <div className="text-[#64748b] text-xs mt-0.5">{a.year} · {a.trackCount} tracks</div>
                  <p className="text-[#64748b] text-xs mt-2 line-clamp-2">{a.description}</p>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => setAlbumModal({ open: true, data: a })}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold text-[#0d9488] border border-[#0d9488]/30 hover:bg-[#0d9488]/10 transition-colors">
                      <Edit2 size={12} /> Edit
                    </button>
                    <button onClick={() => deleteAlbum(a.id)}
                      className="flex items-center justify-center p-1.5 rounded-lg text-red-400 border border-red-100 hover:bg-red-50 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STREAMING LINKS */}
      {tab === 'streaming' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-[#0f172a] flex items-center gap-2"><ExternalLink size={18} className="text-[#0d9488]" /> Streaming Platform Links</h3>
            <p className="text-[#64748b] text-sm mt-1">These URLs appear on the Music page. Paste the actual platform URL for each service.</p>
          </div>
          <div className="divide-y divide-gray-50">
            {links.map((l) => (
              <div key={l.id} className="px-6 py-4 flex items-center gap-4">
                <div className="w-28 font-semibold text-sm text-[#0f172a]">{l.platform}</div>
                <input
                  defaultValue={l.url}
                  onBlur={(e) => { if (e.target.value !== l.url) updateLink(l.id, e.target.value); }}
                  placeholder="https://..."
                  className="flex-1 px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-[#0d9488] focus:outline-none text-sm transition-all"
                />
                <div className={`w-2 h-2 rounded-full ${l.url && l.url !== '#' ? 'bg-green-400' : 'bg-gray-300'}`} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Track Modal */}
      {trackModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h3 className="font-bold text-lg text-[#0f172a]">{trackModal.data.id ? 'Edit Track' : 'Add Track'}</h3>
              <button onClick={() => setTrackModal({ open: false, data: {} })} className="text-[#64748b] hover:text-[#0f172a]"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: 'Title', key: 'title', placeholder: 'e.g. Daily Miracles' },
                { label: 'Album', key: 'album', placeholder: 'e.g. Daily Miracles' },
                { label: 'Duration', key: 'duration', placeholder: 'e.g. 4:12' },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">{f.label}</label>
                  <input value={(trackModal.data as Record<string, unknown>)[f.key] as string || ''}
                    onChange={(e) => setTrackModal({ ...trackModal, data: { ...trackModal.data, [f.key]: e.target.value } })}
                    placeholder={f.placeholder}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#0d9488] focus:outline-none text-sm transition-all" />
                </div>
              ))}
              <AudioUpload
                label="Audio File"
                value={trackModal.data.audioUrl || ''}
                onChange={(url) => setTrackModal({ ...trackModal, data: { ...trackModal.data, audioUrl: url } })}
              />
              <ImageUpload
                label="Cover Image"
                value={trackModal.data.cover || ''}
                onChange={(url) => setTrackModal({ ...trackModal, data: { ...trackModal.data, cover: url } })}
              />
              <label className="flex items-center gap-3 cursor-pointer">
                <div onClick={() => setTrackModal({ ...trackModal, data: { ...trackModal.data, featured: !trackModal.data.featured } })}
                  className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${trackModal.data.featured ? 'bg-[#0d9488]' : 'bg-gray-200'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${trackModal.data.featured ? 'translate-x-4' : ''}`} />
                </div>
                <span className="text-sm font-semibold text-[#0f172a]">Featured Track</span>
              </label>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setTrackModal({ open: false, data: {} })} className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-semibold text-[#64748b] hover:border-gray-300 transition-colors">Cancel</button>
              <button onClick={saveTrack} disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-[#0d9488] text-white text-sm font-semibold hover:bg-[#0f766e] transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Check size={16} /> Save</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Album Modal */}
      {albumModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h3 className="font-bold text-lg text-[#0f172a]">{albumModal.data.id ? 'Edit Album' : 'Add Album'}</h3>
              <button onClick={() => setAlbumModal({ open: false, data: {} })} className="text-[#64748b] hover:text-[#0f172a]"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: 'Title', key: 'title', placeholder: 'Album title' },
                { label: 'Year', key: 'year', placeholder: '2026' },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">{f.label}</label>
                  <input value={(albumModal.data as Record<string, unknown>)[f.key] as string || ''}
                    onChange={(e) => setAlbumModal({ ...albumModal, data: { ...albumModal.data, [f.key]: e.target.value } })}
                    placeholder={f.placeholder}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#0d9488] focus:outline-none text-sm transition-all" />
                </div>
              ))}
              <ImageUpload
                label="Cover Image"
                value={albumModal.data.cover || ''}
                onChange={(url) => setAlbumModal({ ...albumModal, data: { ...albumModal.data, cover: url } })}
              />
              <div>
                <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">Type</label>
                <select value={albumModal.data.type || 'Album'}
                  onChange={(e) => setAlbumModal({ ...albumModal, data: { ...albumModal.data, type: e.target.value } })}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#0d9488] focus:outline-none text-sm bg-white transition-all">
                  {['Album', 'EP', 'Single'].map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">Track Count</label>
                <input type="number" value={albumModal.data.trackCount || 0}
                  onChange={(e) => setAlbumModal({ ...albumModal, data: { ...albumModal.data, trackCount: Number(e.target.value) } })}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#0d9488] focus:outline-none text-sm transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">Description</label>
                <textarea value={albumModal.data.description || ''}
                  onChange={(e) => setAlbumModal({ ...albumModal, data: { ...albumModal.data, description: e.target.value } })}
                  rows={3} placeholder="Album description..."
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#0d9488] focus:outline-none text-sm transition-all resize-none" />
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setAlbumModal({ open: false, data: {} })} className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-semibold text-[#64748b] hover:border-gray-300 transition-colors">Cancel</button>
              <button onClick={saveAlbum} disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-[#0d9488] text-white text-sm font-semibold hover:bg-[#0f766e] transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Check size={16} /> Save</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
