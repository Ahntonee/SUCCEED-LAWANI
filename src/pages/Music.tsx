import { useCallback, useEffect, useRef, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Play, Pause, SkipForward, SkipBack, Download, Music2, Disc3, Star, Headphones, ImageIcon, Youtube, X, ExternalLink } from 'lucide-react';
import { api } from '../lib/api';
import { useSiteContent } from '../context/SiteContentContext';
import { useAudioPlayer, formatTime, downloadTrack } from '../hooks/useAudioPlayer';
import { useSEO } from '../hooks/useSEO';

interface Track {
  id: number;
  title: string;
  album: string;
  duration: string;
  cover: string;
  audioUrl: string;
  featured: boolean;
}

interface Album {
  id: number;
  title: string;
  year: string;
  type: string;
  cover: string;
  trackCount: number;
  description: string;
}

function isSpotifyUrl(url: string): boolean {
  return !!url && url.includes('spotify.com/track/');
}

function getSpotifyEmbedUrl(url: string): string | null {
  const match = url.match(/spotify\.com\/track\/([a-zA-Z0-9]+)/);
  if (!match) return null;
  return `https://open.spotify.com/embed/track/${match[1]}?utm_source=generator&theme=0`;
}

function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const shorts = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{1,12})/);
  if (shorts) return `https://www.youtube.com/embed/${shorts[1]}`;
  const standard = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{1,12})/);
  if (standard) return `https://www.youtube.com/embed/${standard[1]}`;
  return null;
}

export default function Music() {
  const { content } = useSiteContent();
  useSEO({
    title: content.seo_music_title || 'Music',
    description: content.seo_music_desc || 'Stream and download gospel music by Succeed Michael Lawani. Explore albums, singles, and live performances.',
  });
  const [tracks, setTracks] = useState<Track[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [streamingLinks, setStreamingLinks] = useState<{ id: number; platform: string; url: string }[]>([]);
  const [currentTrack, setCurrentTrack] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [spotifyModal, setSpotifyModal] = useState<{ url: string; title: string } | null>(null);

  const tracksRef = useRef<Track[]>([]);
  useEffect(() => { tracksRef.current = tracks; }, [tracks]);

  // Auto-advance using functional updater — no stale-closure risk, no extra ref
  const handleAutoNext = useCallback(() => {
    setCurrentTrack((prev) => {
      if (prev === null) return null;
      const list = tracksRef.current;
      if (!list.length) return null;
      const idx = list.findIndex((t) => t.id === prev);
      return list[(idx + 1) % list.length].id;
    });
  }, []);

  const { progress, currentTime, duration: audioDuration, audioRef, seek: handleSeek, resetProgress } = useAudioPlayer(
    handleAutoNext,
    () => setIsPlaying(false),
  );

  // ── Fetch data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    window.scrollTo(0, 0);
    api.getTracks().then(setTracks).catch(console.error);
    api.getAlbums().then(setAlbums).catch(console.error);
    api.getStreamingLinks().then(setStreamingLinks).catch(console.error);
  }, []);

  // Update src when track changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || currentTrack === null) return;
    const track = tracksRef.current.find((t) => t.id === currentTrack);
    if (!track) return;
    resetProgress();
    if (track.audioUrl) {
      audio.src = track.audioUrl;
      audio.load();
      if (isPlaying) audio.play().catch(console.error);
    } else {
      audio.src = '';
      setIsPlaying(false);
    }
  }, [currentTrack]); // eslint-disable-line react-hooks/exhaustive-deps

  // Play / pause toggle
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying && audio.src) audio.play().catch(() => setIsPlaying(false));
    else audio.pause();
  }, [isPlaying]);

  const handlePlay = (track: Track) => {
    if (isSpotifyUrl(track.audioUrl)) {
      setSpotifyModal({ url: track.audioUrl, title: track.title });
      return;
    }
    if (currentTrack === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(track.id);
      setIsPlaying(true);
    }
  };

  const handleNext = () => {
    const list = tracksRef.current;
    if (!currentTrack || !list.length) return;
    const idx = list.findIndex((t) => t.id === currentTrack);
    setCurrentTrack(list[(idx + 1) % list.length].id);
  };

  const handlePrev = () => {
    const list = tracksRef.current;
    if (!currentTrack || !list.length) return;
    const idx = list.findIndex((t) => t.id === currentTrack);
    setCurrentTrack(list[(idx - 1 + list.length) % list.length].id);
  };

  const handleDownload = (track: Track) => downloadTrack(track.audioUrl, track.title);

  const currentTrackData = tracks.find((t) => t.id === currentTrack);

  const videos = (Array.from({ length: 6 }, (_, i) => {
    const url = content[`video_${i + 1}_url`] || '';
    const title = content[`video_${i + 1}_title`] || '';
    const embedUrl = getYouTubeEmbedUrl(url);
    return embedUrl ? { embedUrl, title } : null;
  }).filter(Boolean)) as { embedUrl: string; title: string }[];

  // Dynamic album art from admin content
  const albumCover1 = content.hero_album_cover_1 || '';
  const albumCover2 = content.hero_album_cover_2 || '';

  return (
    <div className="min-h-screen bg-white pb-32">
      <Navbar />

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="pt-28 pb-16 bg-gradient-to-br from-[#f0fdfa] via-[#ccfbf1] to-[#99f6e4] relative overflow-hidden">
        <div className="absolute w-[600px] h-[600px] bg-[rgba(13,148,136,0.08)] rounded-full -top-[200px] -right-[100px]" />
        <div className="absolute w-[400px] h-[400px] bg-[rgba(6,182,212,0.06)] rounded-full -bottom-[100px] -left-[100px]" />
        <div className="max-w-[1400px] mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#0d9488]/10 text-[#0d9488] px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <Music2 size={16} /> Discography
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-[#0f172a] mb-6 leading-tight">
                The Sound of <span className="text-[#0d9488]">Inspiration</span>
              </h1>
              <p className="text-[#64748b] text-lg leading-relaxed mb-8">
                From soul-stirring gospel to uplifting inspirational anthems, discover music that speaks to the heart and moves the soul. Every track is crafted with passion, purpose, and prayer.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-3 bg-white rounded-xl px-5 py-3 shadow-md">
                  <Disc3 className="text-[#0d9488]" size={24} />
                  <div>
                    <div className="font-bold text-[#0f172a]">{albums.length || '4'}</div>
                    <div className="text-xs text-[#64748b]">Albums & EPs</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white rounded-xl px-5 py-3 shadow-md">
                  <Music2 className="text-[#0d9488]" size={24} />
                  <div>
                    <div className="font-bold text-[#0f172a]">{tracks.length > 0 ? `${tracks.length}+` : '20+'}</div>
                    <div className="text-xs text-[#64748b]">Released Tracks</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white rounded-xl px-5 py-3 shadow-md">
                  <Headphones className="text-[#0d9488]" size={24} />
                  <div>
                    <div className="font-bold text-[#0f172a]">{content.streams_count || '1M+'}</div>
                    <div className="text-xs text-[#64748b]">Total Streams</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Album art — from admin content or placeholder */}
            <div className="flex justify-center">
              <div className="relative">
                {albumCover1 ? (
                  <img src={albumCover1} alt="Latest Album"
                    className="w-72 h-72 rounded-full shadow-2xl object-cover animate-spin" fetchPriority="high" decoding="async"
                    style={{ animationDuration: '20s', animationTimingFunction: 'linear', animationIterationCount: 'infinite' }} />
                ) : (
                  <div className="w-72 h-72 rounded-3xl shadow-2xl bg-gradient-to-br from-[#0d9488] to-[#0f172a] flex items-center justify-center">
                    <div className="text-center text-white/50 p-6">
                      <ImageIcon size={40} className="mx-auto mb-2 opacity-40" />
                      <p className="text-xs">Upload in Admin → Site Content<br />Music Hero — Main Album Art</p>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-16 h-16 bg-white rounded-full shadow-lg" />
                </div>
                {albumCover2 ? (
                  <img src={albumCover2} alt="Featured Single"
                    className="absolute -bottom-6 -right-6 w-32 h-32 rounded-2xl shadow-xl object-cover border-4 border-white" loading="lazy" decoding="async" />
                ) : (
                  <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-2xl shadow-xl border-4 border-white bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center">
                    <Music2 size={24} className="text-white opacity-60" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Tracks ─────────────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0f172a] mb-4">Featured <span className="text-[#0d9488]">Tracks</span></h2>
            <p className="text-[#64748b]">My most popular releases — the songs that have connected most deeply with listeners around the world.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {tracks.filter((t) => t.featured).map((track) => (
              <div key={track.id} className="bg-[#f8fafc] rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                <div className="flex">
                  <div className="relative w-40 h-40 flex-shrink-0">
                    <img src={track.cover} alt={track.title} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                    <button onClick={() => handlePlay(track)}
                      className="absolute inset-0 bg-[#0d9488]/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {isSpotifyUrl(track.audioUrl) ? <Play className="text-white ml-1" size={32} /> : currentTrack === track.id && isPlaying ? <Pause className="text-white" size={32} /> : <Play className="text-white ml-1" size={32} />}
                    </button>
                  </div>
                  <div className="p-5 flex flex-col justify-center flex-1">
                    <span className="bg-[#0d9488]/10 text-[#0d9488] text-xs font-bold px-2 py-0.5 rounded-full w-fit mb-2">Featured</span>
                    <h3 className="text-xl font-bold text-[#0f172a] mb-1">{track.title}</h3>
                    <p className="text-[#64748b] text-sm mb-3">{track.album} &bull; {track.duration}</p>
                    <div className="flex gap-2">
                      <button onClick={() => handlePlay(track)} disabled={!track.audioUrl}
                        className="bg-[#0d9488] text-white px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-[#0f766e] transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed">
                        {isSpotifyUrl(track.audioUrl) ? <><Play size={14} /> Listen</> : currentTrack === track.id && isPlaying ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Play</>}
                      </button>
                      {isSpotifyUrl(track.audioUrl) ? (
                        <a href={track.audioUrl} target="_blank" rel="noopener noreferrer"
                          className="bg-white border-2 border-gray-200 text-[#0f172a] px-4 py-1.5 rounded-full text-sm font-semibold hover:border-[#0d9488] hover:text-[#0d9488] transition-colors flex items-center gap-1">
                          <ExternalLink size={14} /> Spotify
                        </a>
                      ) : (
                        <button onClick={() => handleDownload(track)} disabled={!track.audioUrl}
                          className="bg-white border-2 border-gray-200 text-[#0f172a] px-4 py-1.5 rounded-full text-sm font-semibold hover:border-[#0d9488] hover:text-[#0d9488] transition-colors flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed">
                          <Download size={14} /> Download
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── All Tracks ──────────────────────────────────────────────────────── */}
      <section className="py-16 bg-[#f8fafc]">
        <div className="max-w-[1000px] mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0f172a] mb-4">All <span className="text-[#0d9488]">Tracks</span></h2>
            <p className="text-[#64748b]">The complete collection — stream, download, and add to your playlists.</p>
          </div>
          <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
            {tracks.map((track, index) => (
              <div key={track.id}
                className={`flex items-center gap-4 p-4 transition-colors group ${index !== tracks.length - 1 ? 'border-b border-gray-100' : ''} ${currentTrack === track.id ? 'bg-[#f0fdfa]' : 'hover:bg-[#f8fafc]'} ${track.audioUrl ? 'cursor-pointer' : 'cursor-default'}`}
                onClick={() => track.audioUrl && handlePlay(track)}>
                <div className="text-[#64748b] text-sm font-semibold w-6 text-center">
                  {currentTrack === track.id && isPlaying ? (
                    <div className="flex gap-0.5 justify-center items-end h-4">
                      <div className="w-1 bg-[#0d9488] animate-pulse h-2" />
                      <div className="w-1 bg-[#0d9488] animate-pulse h-3" style={{ animationDelay: '0.1s' }} />
                      <div className="w-1 bg-[#0d9488] animate-pulse h-4" style={{ animationDelay: '0.2s' }} />
                    </div>
                  ) : (
                    <>
                      <span className={track.audioUrl ? 'group-hover:hidden' : ''}>{index + 1}</span>
                      {track.audioUrl && <Play size={14} className="mx-auto hidden group-hover:block text-[#0d9488]" />}
                    </>
                  )}
                </div>
                <img src={track.cover} alt={track.title} className="w-12 h-12 rounded-lg object-cover" loading="lazy" decoding="async" />
                <div className="flex-1 min-w-0">
                  <h4 className={`font-semibold truncate ${currentTrack === track.id ? 'text-[#0d9488]' : 'text-[#0f172a]'}`}>{track.title}</h4>
                  <p className="text-[#64748b] text-sm">{track.album}</p>
                </div>
                {!track.audioUrl && <span className="text-xs text-gray-400 italic hidden sm:block">No audio</span>}
                <span className="text-[#64748b] text-sm hidden sm:block">{track.duration}</span>
                {isSpotifyUrl(track.audioUrl) ? (
                  <a href={track.audioUrl} target="_blank" rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[#1DB954] hover:text-[#1DB954]/80 transition-colors" title="Open on Spotify">
                    <ExternalLink size={18} />
                  </a>
                ) : (
                  <button className="text-[#64748b] hover:text-[#0d9488] transition-colors disabled:opacity-30"
                    disabled={!track.audioUrl}
                    onClick={(e) => { e.stopPropagation(); handleDownload(track); }}>
                    <Download size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Albums Grid ─────────────────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0f172a] mb-4">Albums & <span className="text-[#0d9488]">EPs</span></h2>
            <p className="text-[#64748b]">Explore the full discography — each project tells a unique story.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {albums.map((album) => (
              <div key={album.id} className="bg-[#f8fafc] rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
                <div className="relative overflow-hidden">
                  <img src={album.cover} alt={album.title} className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" decoding="async" />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-[#0d9488] text-xs font-bold px-2.5 py-1 rounded-full">{album.type}</div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-[#0f172a] text-lg mb-1">{album.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-[#64748b] mb-3">
                    <Star size={12} className="text-[#f59e0b]" />
                    <span>{album.year}</span>
                    <span>&bull;</span>
                    <span>{album.trackCount} tracks</span>
                  </div>
                  <p className="text-[#64748b] text-sm leading-relaxed line-clamp-3">{album.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Music Videos ────────────────────────────────────────────────────── */}
      {videos.length > 0 && (
        <section className="py-16 bg-[#f8fafc]">
          <div className="max-w-[1400px] mx-auto px-6">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-[#0d9488]/10 text-[#0d9488] px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <Youtube size={16} /> Music Videos
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#0f172a] mb-4">Watch & <span className="text-[#0d9488]">Listen</span></h2>
              <p className="text-[#64748b]">Music videos, live performances, and more — right here on the site.</p>
            </div>
            <div className={`grid gap-6 ${videos.length === 1 ? 'max-w-2xl mx-auto' : videos.length === 2 ? 'sm:grid-cols-2 max-w-3xl mx-auto' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
              {videos.map((video, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      src={video.embedUrl}
                      title={video.title || `Video ${i + 1}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      loading="lazy"
                      className="absolute inset-0 w-full h-full"
                    />
                  </div>
                  {video.title && (
                    <div className="px-4 py-3">
                      <p className="font-semibold text-[#0f172a] text-sm leading-snug">{video.title}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Streaming Platforms ─────────────────────────────────────────────── */}
      <section className="py-16 bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white">
        <div className="max-w-[800px] mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Stream on Your Favorite <span className="text-[#14b8a6]">Platform</span></h2>
          <p className="text-white/60 mb-8">Available on all major streaming services. Add to your playlists and never miss a release.</p>
          <div className="flex flex-wrap justify-center gap-4">
            {streamingLinks.filter((l) => l.url && l.url !== '#').length > 0
              ? streamingLinks.filter((l) => l.url && l.url !== '#').map((link) => (
                <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                  className="bg-white/10 hover:bg-[#0d9488] text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 hover:-translate-y-0.5">
                  {link.platform}
                </a>
              ))
              : ['Spotify', 'Apple Music', 'YouTube Music', 'Boomplay', 'Audiomack', 'Deezer'].map((p) => (
                <span key={p} className="bg-white/5 text-white/40 px-6 py-3 rounded-full font-semibold cursor-default border border-white/10">{p}</span>
              ))}
          </div>
          {streamingLinks.filter((l) => l.url && l.url !== '#').length === 0 && (
            <p className="text-white/30 text-xs mt-4">Streaming links coming soon — update in Admin → Music → Streaming Links</p>
          )}
        </div>
      </section>

      {/* ── Fixed Player Bar ────────────────────────────────────────────────── */}
      {currentTrack !== null && currentTrackData && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-50 px-4 py-3">
          <div className="max-w-[1400px] mx-auto flex items-center gap-4">
            <img src={currentTrackData.cover} alt={currentTrackData.title} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-[#0f172a] text-sm truncate">{currentTrackData.title}</h4>
              <p className="text-[#64748b] text-xs">{currentTrackData.album}</p>
              <div className="w-full h-1.5 bg-gray-200 rounded-full mt-2 cursor-pointer" onClick={handleSeek}>
                <div className="h-full bg-[#0d9488] rounded-full transition-all duration-100" style={{ width: `${progress}%` }} />
              </div>
              <div className="flex justify-between text-[10px] text-[#64748b] mt-0.5">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(audioDuration)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handlePrev} className="text-[#0f172a] hover:text-[#0d9488] transition-colors"><SkipBack size={20} /></button>
              <button onClick={() => setIsPlaying(!isPlaying)}
                className="w-10 h-10 bg-[#0d9488] text-white rounded-full flex items-center justify-center hover:bg-[#0f766e] transition-colors">
                {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
              </button>
              <button onClick={handleNext} className="text-[#0f172a] hover:text-[#0d9488] transition-colors"><SkipForward size={20} /></button>
            </div>
          </div>
        </div>
      )}

      <Footer />

      {/* ── Spotify Embed Modal ──────────────────────────────────────────────── */}
      {spotifyModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setSpotifyModal(null)}>
          <div className="bg-white rounded-2xl overflow-hidden w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <p className="text-xs text-[#64748b] mb-0.5">Now Playing</p>
                <h3 className="font-bold text-[#0f172a] text-sm">{spotifyModal.title}</h3>
              </div>
              <button onClick={() => setSpotifyModal(null)} className="text-[#64748b] hover:text-[#0f172a] transition-colors">
                <X size={20} />
              </button>
            </div>
            <iframe
              src={getSpotifyEmbedUrl(spotifyModal.url)!}
              width="100%"
              height="352"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              title={spotifyModal.title}
            />
          </div>
        </div>
      )}
    </div>
  );
}
