import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Calendar, Clock, MapPin, Ticket, Users, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { api } from '../lib/api';

interface Event {
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
  status: string;
}

export default function Events() {
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    api.getEvents().then(setAllEvents).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filteredEvents = allEvents.filter((event) => {
    if (filter === 'all') return true;
    return event.status === filter;
  });

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-16 bg-gradient-to-br from-[#f0fdfa] via-[#ccfbf1] to-[#99f6e4] relative overflow-hidden">
        <div className="absolute w-[500px] h-[500px] bg-[rgba(13,148,136,0.08)] rounded-full -top-[150px] -right-[100px]" />
        <div className="max-w-[1400px] mx-auto px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-[#0d9488]/10 text-[#0d9488] px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Calendar size={16} /> Events & Appearances
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#0f172a] mb-6">
              Upcoming <span className="text-[#0d9488]">Events</span>
            </h1>
            <p className="text-[#64748b] text-lg">
              Join me at exclusive concerts, fashion shows, masterclasses, and special appearances. Each event is crafted to inspire, educate, and entertain.
            </p>
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="py-8 bg-white border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex justify-center gap-4">
            {(['all', 'upcoming', 'past'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-6 py-2.5 rounded-full font-semibold text-sm capitalize transition-all duration-300 ${
                  filter === tab
                    ? 'bg-[#0d9488] text-white shadow-lg shadow-[#0d9488]/20'
                    : 'bg-[#f8fafc] text-[#64748b] hover:bg-[#0d9488]/10 hover:text-[#0d9488]'
                }`}
              >
                {tab === 'all' ? 'All Events' : tab === 'upcoming' ? 'Upcoming' : 'Past Events'}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-16 bg-[#f8fafc]">
        <div className="max-w-[1400px] mx-auto px-6">
          {loading && (
            <div className="flex justify-center items-center py-24">
              <div className="w-10 h-10 border-4 border-[#0d9488]/30 border-t-[#0d9488] rounded-full animate-spin" />
            </div>
          )}
          {!loading && filteredEvents.length === 0 && (
            <div className="text-center py-20 text-[#64748b]">No events found.</div>
          )}
          <div className="grid md:grid-cols-2 gap-8">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="relative overflow-hidden h-48">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      event.status === 'upcoming'
                        ? 'bg-[#0d9488] text-white'
                        : 'bg-[#64748b] text-white'
                    }`}>
                      {event.status === 'upcoming' ? 'Upcoming' : 'Past'}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="bg-white/90 backdrop-blur text-[#0d9488] text-xs font-bold px-3 py-1 rounded-full">
                      {event.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="bg-[#0d9488] text-white rounded-2xl px-4 py-3 text-center min-w-[70px]">
                      <div className="text-2xl font-extrabold leading-none">{event.day}</div>
                      <div className="text-xs uppercase tracking-wider mt-1 opacity-80">{event.month}</div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#0f172a] mb-1 group-hover:text-[#0d9488] transition-colors">
                        {event.title}
                      </h3>
                      <p className="text-[#64748b] text-sm line-clamp-2">{event.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-[#64748b] mb-4">
                    <span className="flex items-center gap-1"><Clock size={14} className="text-[#0d9488]" /> {event.time}</span>
                    <span className="flex items-center gap-1"><MapPin size={14} className="text-[#0d9488]" /> {event.location}</span>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-[#0d9488]">{event.price}</span>
                      <span className="text-xs text-[#64748b] flex items-center gap-1"><Users size={12} /> {event.spots}</span>
                    </div>
                    <button
                      onClick={() => setSelectedEvent(event)}
                      className="text-[#0d9488] font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all"
                    >
                      Details <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white">
        <div className="max-w-[800px] mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Want Me at Your <span className="text-[#14b8a6]">Event?</span>
          </h2>
          <p className="text-white/70 mb-8">
            I am available for performances, speaking engagements, fashion shows, and digital marketing consultations. Let us make your next event unforgettable.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-[#0d9488] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#0f766e] transition-colors"
            >
              Book Now <Ticket size={18} />
            </a>
          </div>
        </div>
      </section>

      {/* Event Details Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#0f172a]">{selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="mt-4">
              <img
                src={selectedEvent.image}
                alt={selectedEvent.title}
                className="w-full h-48 object-cover rounded-xl mb-4"
              />
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-[#0d9488] text-white rounded-xl px-4 py-2 text-center">
                  <div className="text-xl font-extrabold leading-none">{selectedEvent.day}</div>
                  <div className="text-xs uppercase mt-0.5">{selectedEvent.month}</div>
                </div>
                <div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    selectedEvent.status === 'upcoming' ? 'bg-[#0d9488]/10 text-[#0d9488]' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {selectedEvent.status === 'upcoming' ? 'Upcoming' : 'Past Event'}
                  </span>
                  <div className="text-sm text-[#64748b] mt-1">{selectedEvent.category}</div>
                </div>
              </div>
              <p className="text-[#64748b] text-sm mb-4 leading-relaxed">{selectedEvent.description}</p>
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-[#64748b]">
                  <Clock size={16} className="text-[#0d9488]" /> {selectedEvent.time}
                </div>
                <div className="flex items-center gap-2 text-sm text-[#64748b]">
                  <MapPin size={16} className="text-[#0d9488]" /> {selectedEvent.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-[#64748b]">
                  <Ticket size={16} className="text-[#0d9488]" /> {selectedEvent.price}
                </div>
                <div className="flex items-center gap-2 text-sm text-[#64748b]">
                  <Users size={16} className="text-[#0d9488]" /> {selectedEvent.spots}
                </div>
              </div>
              {selectedEvent.status === 'upcoming' && (
                <a
                  href="/contact"
                  className="block w-full text-center bg-[#0d9488] text-white py-3 rounded-xl font-semibold hover:bg-[#0f766e] transition-colors"
                >
                  RSVP / Get Tickets
                </a>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
