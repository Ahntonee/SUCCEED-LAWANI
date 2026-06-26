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
  uploadFile: async (file: File, field: 'image' | 'audio'): Promise<string> => {
    const token = getToken();
    const form = new FormData();
    form.append(field, file);
    const res = await fetch(`${BASE}/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    return data.url as string;
  },
  uploadImage: (file: File) => api.uploadFile(file, 'image'),
  uploadAudio: (file: File) => api.uploadFile(file, 'audio'),

  // Public — no auth required
  getPublicPosts: (params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/blog${q}`);
  },
  submitContact: (data: object) =>
    request('/contacts', { method: 'POST', body: JSON.stringify(data) }),
  submitRsvp: (eventId: number, data: object) =>
    request(`/events/${eventId}/rsvp`, { method: 'POST', body: JSON.stringify(data) }),

  // Shop — public
  getProducts: (params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/shop/products${q}`);
  },
  getProduct: (id: number) => request(`/shop/products/${id}`),

  // Verify Paystack payment server-side and create order
  verifyPaystack: (data: {
    reference: string;
    items: { id: number; qty: number }[];
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
  }) => request('/shop/verify-paystack', { method: 'POST', body: JSON.stringify(data) }),

  // Initialise payment — validates gateway config server-side before opening popup
  initPayment: (data: { gateway: 'flutterwave' | 'paystack'; items: { id: number; qty: number }[] }) =>
    request('/shop/payment-init', { method: 'POST', body: JSON.stringify(data) }),

  // Verify Flutterwave payment server-side and create order
  verifyFlutterwave: (data: {
    transactionId: string;
    items: { id: number; qty: number }[];
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
  }) => request('/shop/verify-flutterwave', { method: 'POST', body: JSON.stringify(data) }),

  // Shop — admin
  getAllProducts: () => request('/shop/products'),
  createProduct: (data: object) => request('/shop/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id: number, data: object) => request(`/shop/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteProduct: (id: number) => request(`/shop/products/${id}`, { method: 'DELETE' }),
  getOrders: (params?: { limit?: number; skip?: number }) => {
    const q = params ? '?' + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString() : '';
    return request(`/shop/orders${q}`);
  },
  updateOrder: (id: number, data: object) => request(`/shop/orders/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Fashion inquiries
  getFashionInquiries: (status?: string) => request(`/fashion${status ? `?status=${status}` : ''}`),
  updateFashionInquiry: (id: number, data: object) => request(`/fashion/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteFashionInquiry: (id: number) => request(`/fashion/${id}`, { method: 'DELETE' }),

  // Donations — public
  initDonation: (data: { amount: number; currency?: string; name?: string; email: string; message?: string }) =>
    request('/donations/init', { method: 'POST', body: JSON.stringify(data) }),
  verifyDonation: (reference: string) =>
    request(`/donations/verify/${encodeURIComponent(reference)}`),

  // Donations — admin
  getDonations: () => request('/donations'),
};
