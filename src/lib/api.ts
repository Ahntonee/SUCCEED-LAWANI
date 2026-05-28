const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

function getToken() {
  return localStorage.getItem('admin_token');
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: () => request('/auth/me'),
  updateProfile: (data: object) =>
    request('/auth/me', { method: 'PATCH', body: JSON.stringify(data) }),

  // Music
  getTracks: () => request('/music/tracks'),
  createTrack: (data: object) => request('/music/tracks', { method: 'POST', body: JSON.stringify(data) }),
  updateTrack: (id: number, data: object) => request(`/music/tracks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteTrack: (id: number) => request(`/music/tracks/${id}`, { method: 'DELETE' }),
  getAlbums: () => request('/music/albums'),
  createAlbum: (data: object) => request('/music/albums', { method: 'POST', body: JSON.stringify(data) }),
  updateAlbum: (id: number, data: object) => request(`/music/albums/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteAlbum: (id: number) => request(`/music/albums/${id}`, { method: 'DELETE' }),
  getStreamingLinks: () => request('/music/streaming-links'),
  updateStreamingLink: (id: number, data: object) => request(`/music/streaming-links/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Events
  getEvents: (status?: string) => request(`/events${status ? `?status=${status}` : ''}`),
  createEvent: (data: object) => request('/events', { method: 'POST', body: JSON.stringify(data) }),
  updateEvent: (id: number, data: object) => request(`/events/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteEvent: (id: number) => request(`/events/${id}`, { method: 'DELETE' }),
  getEventRsvps: (id: number) => request(`/events/${id}/rsvps`),

  // Blog
  getBlogPosts: () => request('/blog/all'),
  createBlogPost: (data: object) => request('/blog', { method: 'POST', body: JSON.stringify(data) }),
  updateBlogPost: (id: number, data: object) => request(`/blog/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteBlogPost: (id: number) => request(`/blog/${id}`, { method: 'DELETE' }),

  // Contacts
  getContacts: (params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/contacts${q}`);
  },
  updateContact: (id: number, data: object) => request(`/contacts/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteContact: (id: number) => request(`/contacts/${id}`, { method: 'DELETE' }),

  // Content
  getContent: () => request('/content'),
  updateContentKey: (key: string, value: string) =>
    request(`/content/${key}`, { method: 'PATCH', body: JSON.stringify({ value }) }),
  bulkUpdateContent: (data: Record<string, string>) =>
    request('/content', { method: 'PATCH', body: JSON.stringify(data) }),

  // Subscribers
  getSubscribers: () => request('/subscribers'),
  deleteSubscriber: (id: number) => request(`/subscribers/${id}`, { method: 'DELETE' }),
  subscribeEmail: (email: string) =>
    request('/subscribers', { method: 'POST', body: JSON.stringify({ email }) }),

  // File upload (admin)
  uploadImage: async (file: File): Promise<string> => {
    const token = getToken();
    const form = new FormData();
    form.append('image', file);
    const res = await fetch(`${BASE}/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    return data.url as string;
  },
  uploadAudio: async (file: File): Promise<string> => {
    const token = getToken();
    const form = new FormData();
    form.append('audio', file);
    const res = await fetch(`${BASE}/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    return data.url as string;
  },

  // Public — no auth required
  getPublicPosts: (params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/blog${q}`);
  },
  submitContact: (data: object) =>
    request('/contacts', { method: 'POST', body: JSON.stringify(data) }),
  submitRsvp: (eventId: number, data: object) =>
    request(`/events/${eventId}/rsvp`, { method: 'POST', body: JSON.stringify(data) }),

  // Fashion inquiries
  getFashionInquiries: (status?: string) => request(`/fashion${status ? `?status=${status}` : ''}`),
  updateFashionInquiry: (id: number, data: object) => request(`/fashion/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteFashionInquiry: (id: number) => request(`/fashion/${id}`, { method: 'DELETE' }),
};
