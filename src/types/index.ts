export interface Admin {
  id: number;
  email: string;
  name: string;
}

export interface Track {
  id: number;
  title: string;
  album: string;
  duration: string;
  cover: string;
  audioUrl: string;
  featured: boolean;
  playCount: number;
  downloadCount: number;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Album {
  id: number;
  title: string;
  year: string;
  type: string;
  cover: string;
  trackCount: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface StreamingLink {
  id: number;
  platform: string;
  url: string;
  active: boolean;
}

export interface Event {
  id: number;
  title: string;
  date: string;
  day: string;
  month: string;
  time: string;
  location: string;
  image: string;
  category: string;
  description: string;
  price: string;
  spots: string;
  status: 'upcoming' | 'past';
  createdAt: string;
  updatedAt: string;
}

export interface Rsvp {
  id: number;
  eventId: number;
  name: string;
  email: string;
  phone: string;
  ticketCount: number;
  paymentStatus: string;
  createdAt: string;
}

export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  tags: string[];
  featured: boolean;
  status: 'published' | 'draft';
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: number;
  name: string;
  email: string;
  subject: string;
  inquiryType: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  createdAt: string;
  updatedAt: string;
}

export interface Subscriber {
  id: number;
  email: string;
  active: boolean;
  createdAt: string;
}

export interface FashionInquiry {
  id: number;
  name: string;
  email: string;
  phone: string;
  garmentType: string;
  measurements: string;
  budget: string;
  notes: string;
  status: 'new' | 'in-progress' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export type SiteContent = Record<string, string>;
