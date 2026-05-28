import prisma from './prisma';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  console.log('Seeding database with all hardcoded site data...');

  // Admin
  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
  await prisma.admin.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'hello@succeedlawani.com' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'hello@succeedlawani.com',
      password: hashedPassword,
      name: 'Succeed Michael Lawani',
    },
  });

  // Tracks
  const tracks = [
    { title: 'Daily Miracles', album: 'Daily Miracles', duration: '4:12', cover: '/images/album-daily-miracles.jpg', featured: true, order: 1 },
    { title: 'Philistine', album: 'Philistine', duration: '3:45', cover: '/images/album-philistine.jpg', featured: true, order: 2 },
    { title: 'Rise Up', album: 'Rise Up', duration: '3:58', cover: '/images/album-daily-miracles.jpg', featured: false, order: 3 },
    { title: 'Eternal Praise', album: 'Eternal Praise', duration: '5:21', cover: '/images/album-philistine.jpg', featured: false, order: 4 },
    { title: 'Victory Dance', album: 'Daily Miracles', duration: '3:33', cover: '/images/album-daily-miracles.jpg', featured: false, order: 5 },
    { title: 'Your Grace', album: 'Daily Miracles', duration: '4:45', cover: '/images/album-daily-miracles.jpg', featured: false, order: 6 },
    { title: 'No Limits', album: 'Rise Up', duration: '3:22', cover: '/images/album-daily-miracles.jpg', featured: false, order: 7 },
    { title: 'Faith Over Fear', album: 'Rise Up', duration: '4:01', cover: '/images/album-daily-miracles.jpg', featured: false, order: 8 },
  ];
  for (const t of tracks) {
    await prisma.track.upsert({ where: { id: tracks.indexOf(t) + 1 }, update: t, create: t });
  }

  // Albums
  const albums = [
    { title: 'Daily Miracles', year: '2026', type: 'Album', cover: '/images/album-daily-miracles.jpg', trackCount: 12, description: 'An inspirational journey through faith, gratitude, and the beauty of everyday blessings. Features the hit title track and collaborations with top gospel artists.' },
    { title: 'Philistine', year: '2025', type: 'Single', cover: '/images/album-philistine.jpg', trackCount: 1, description: 'A powerful declaration of victory over every obstacle. This anthem of triumph has resonated with millions facing their own giants.' },
    { title: 'Rise Up', year: '2024', type: 'EP', cover: '/images/album-daily-miracles.jpg', trackCount: 6, description: 'The debut EP that introduced Succeed to the world. A collection of uplifting songs about perseverance, hope, and never giving up on your dreams.' },
    { title: 'Eternal Praise', year: '2023', type: 'Single', cover: '/images/album-philistine.jpg', trackCount: 1, description: 'A soul-stirring worship single recorded live at the Victory Christian Centre. Captures the raw energy of communal praise.' },
  ];
  for (const a of albums) {
    await prisma.album.upsert({ where: { id: albums.indexOf(a) + 1 }, update: a, create: a });
  }

  // Streaming links
  const platforms = ['Spotify', 'Apple Music', 'YouTube Music', 'Boomplay', 'Audiomack', 'Deezer'];
  for (const platform of platforms) {
    await prisma.streamingLink.upsert({ where: { platform }, update: {}, create: { platform, url: '#', active: true } });
  }

  // Events
  const events = [
    { title: 'Daily Miracles Album Launch', date: 'June 15, 2026', day: '15', month: 'JUN', time: '6:00 PM', location: 'Eko Hotel & Suites, Lagos', image: '/images/concert.jpg', category: 'Music', description: 'Join us for an unforgettable night of music, worship, and celebration as we launch the highly anticipated "Daily Miracles" album. Experience live performances, special guest appearances, and an atmosphere filled with inspiration and joy.', price: '₦5,000', spots: '500 spots left', status: 'upcoming' },
    { title: 'TheSucceedeer Fashion Showcase', date: 'July 22, 2026', day: '22', month: 'JUL', time: '4:00 PM', location: 'Transcorp Hilton, Abuja', image: '/images/fashion-show.jpg', category: 'Fashion', description: 'An exclusive runway show featuring our latest collection of bespoke suits, agbada, and contemporary African wear. Witness the fusion of tradition and modernity in a stunning visual spectacle.', price: '₦10,000', spots: '200 spots left', status: 'upcoming' },
    { title: 'Digital Marketing Masterclass', date: 'August 10, 2026', day: '10', month: 'AUG', time: '2:00 PM', location: 'Online (Zoom)', image: '/images/marketing-workspace.jpg', category: 'Education', description: 'Learn advanced Facebook Ads strategies, DMI techniques, and conversion optimization from industry experts. Perfect for business owners, marketers, and anyone looking to scale their digital presence.', price: '₦15,000', spots: 'Unlimited', status: 'upcoming' },
    { title: 'Philistine Live Concert', date: 'September 5, 2026', day: '05', month: 'SEP', time: '5:00 PM', location: 'Aztec Arcum Arena, Port Harcourt', image: '/images/concert.jpg', category: 'Music', description: 'Experience the power of "Philistine" live! An evening of victory, praise, and powerful declarations. Come prepared for an electrifying performance that will leave you transformed.', price: '₦3,000', spots: '1,000 spots left', status: 'upcoming' },
    { title: 'Lagos Fashion Week 2025', date: 'October 12, 2025', day: '12', month: 'OCT', time: '7:00 PM', location: 'Federal Palace Hotel, Lagos', image: '/images/fashion-show.jpg', category: 'Fashion', description: 'TheSucceedeer Designs made a stunning debut at Lagos Fashion Week, showcasing the "Royal Heritage" collection that blends traditional African aesthetics with contemporary fashion trends.', price: 'Free', spots: 'Event ended', status: 'past' },
    { title: 'New Year Worship Concert', date: 'January 1, 2026', day: '01', month: 'JAN', time: '10:00 PM', location: 'Tafawa Balewa Square, Lagos', image: '/images/concert.jpg', category: 'Music', description: 'A spectacular New Year celebration concert that brought together over 10,000 worshippers for a night of praise, prayer, and prophetic declarations for the year ahead.', price: 'Free', spots: 'Event ended', status: 'past' },
    { title: 'Digital Marketing Summit', date: 'March 15, 2026', day: '15', month: 'MAR', time: '9:00 AM', location: 'Landmark Centre, Lagos', image: '/images/marketing-workspace.jpg', category: 'Education', description: 'A full-day intensive workshop where Succeed shared cutting-edge strategies for Facebook Ads, conversion optimization, and brand growth with over 200 participants.', price: '₦25,000', spots: 'Event ended', status: 'past' },
    { title: 'Valentine Special Performance', date: 'February 14, 2026', day: '14', month: 'FEB', time: '7:00 PM', location: 'Jazzhole, Lagos', image: '/images/concert.jpg', category: 'Music', description: 'An intimate acoustic evening filled with love songs, inspirational music, and special duets. A perfect Valentine celebration for couples and music lovers.', price: '₦8,000', spots: 'Event ended', status: 'past' },
  ];
  for (const e of events) {
    await prisma.event.upsert({ where: { id: events.indexOf(e) + 1 }, update: e, create: e });
  }

  // Blog Posts
  const posts = [
    { title: 'The Story Behind Daily Miracles: From Traffic Jam to Timeless Anthem', excerpt: 'How a moment of prayer in Lagos traffic inspired one of my most powerful songs yet. The journey from concept to creation was nothing short of divine.', content: `It was a rainy Tuesday evening in Lagos. I was stuck in the infamous Third Mainland Bridge traffic, frustration building with every passing minute. My phone was dead, the AC was struggling, and I had a meeting I was clearly going to miss.\n\nIn that moment of helplessness, I did something I had not done in a while — I prayed. Not a rushed blessing or a quick wish, but a genuine conversation with God. I asked for patience, for peace, and for the ability to see the miracles in everyday moments.\n\nAs the rain pattered against my windshield, the melody came to me. It started as a hum, then words began to form. "Every morning I wake up, I see Your daily miracles..." The traffic that had felt like a curse became a blessing — it gave me the stillness I needed to receive this gift.\n\nWhen I finally got home three hours later, I recorded a voice note that would become the foundation of "Daily Miracles." The song wrote itself over the next week, each verse flowing like a continuation of that prayer on the bridge.\n\nWorking with producer Salvage Beat, we crafted a sound that was both contemporary and timeless — something that could play in a church on Sunday morning or a playlist during a workout. The response has been overwhelming. Messages from people sharing their own "daily miracles" stories fill my DMs every day.\n\nThis song taught me that inspiration is everywhere. You just need to be still enough to hear it.`, image: '/images/album-daily-miracles.jpg', category: 'Music', date: 'May 10, 2026', readTime: '5 min read', tags: 'Music Production,Inspiration,Behind the Scenes', featured: true, status: 'published' },
    { title: 'Agbada: The Royal Attire Reimagined for the Modern Era', excerpt: 'Exploring how modern fashion designers are transforming traditional Agbada into contemporary statements of elegance and power.', content: `The Agbada has long been a symbol of prestige, power, and cultural pride in West Africa. Traditionally worn by royalty and dignitaries, this flowing wide-sleeved robe carries centuries of history in every stitch.\n\nAt TheSucceedeer Designs, we believe that tradition and innovation are not opposites — they are dance partners. Our approach to the Agbada honors its regal heritage while embracing contemporary aesthetics.\n\nOne of our most popular designs, the "Executive Agbada," features a fitted inner layer paired with a flowing outer robe, creating a profile that is both commanding and comfortable. We have replaced the traditional heavy embroidery with laser-cut geometric patterns, reducing weight while maintaining visual impact.\n\nThe response from our clients has been incredible. Young professionals are wearing our Agbadas to corporate events. Grooms are choosing them for weddings. Even international clients have discovered the beauty of this garment through our online platform.`, image: '/images/blog-fashion.jpg', category: 'Fashion', date: 'April 28, 2026', readTime: '6 min read', tags: 'Fashion Design,African Culture,Style Guide', featured: false, status: 'published' },
    { title: 'Facebook Ads in 2026: What Is Actually Working Right Now', excerpt: 'Latest strategies, algorithm updates, and creative approaches that are driving 5x ROAS for our clients in the current landscape.', content: `The digital marketing landscape is evolving faster than ever, and Facebook Ads continues to be one of the most powerful tools in a marketer\'s arsenal — if you know how to use it.\n\nAfter managing over 500 campaigns and ₦500M+ in ad spend, here is what is actually working in 2026:\n\n1. AI-Powered Creative Optimization\nMeta\'s AI has become incredibly sophisticated at matching creative variations to different audience segments. We are now creating 10-15 variations of each ad and letting the algorithm do the heavy lifting.\n\n2. First-Party Data Strategies\nWith the continued phase-out of third-party cookies, first-party data has become gold.\n\n3. Video-First Creative\nShort-form video (15-30 seconds) is dominating. Not polished, cinematic ads — but authentic, raw, phone-shot content.\n\n4. Advantage+ Shopping Campaigns\nMeta\'s automated shopping campaigns have matured significantly.\n\n5. Community-Building Over Conversion\nThe most successful brands are using ads to build communities, not just drive sales.`, image: '/images/marketing-workspace.jpg', category: 'Marketing', date: 'April 15, 2026', readTime: '8 min read', tags: 'Facebook Ads,Digital Marketing,Growth Strategy', featured: false, status: 'published' },
    { title: 'From Sketch to Stage: My Creative Process Revealed', excerpt: 'An inside look at how I balance music, fashion, and marketing — and the creative rituals that keep me inspired.', content: `People often ask me how I manage to juggle three demanding careers simultaneously. The truth is, I do not see them as separate — they are different expressions of the same creative impulse.\n\nMy day starts at 5 AM with prayer and meditation. This quiet hour sets the tone for everything that follows.\n\nFrom 6 to 9 AM, I am in my design studio. Late morning through afternoon is music time. Evenings are for marketing strategy and client calls.\n\nThe secret? Each discipline refreshes me for the others. When music feels heavy, I turn to design. When design feels stagnant, I dive into data. It is a rhythm, not a race.`, image: '/images/blog-music.jpg', category: 'Lifestyle', date: 'March 30, 2026', readTime: '7 min read', tags: 'Creativity,Productivity,Personal Growth', featured: false, status: 'published' },
    { title: 'Building TheSucceedeer: Lessons from 5 Years in Fashion', excerpt: 'The highs, the lows, and the invaluable lessons learned while building a fashion brand from scratch in Nigeria.', content: `Five years ago, TheSucceedeer Designs was a dream sketched in a notebook. Today, it is a recognized brand with clients across three continents.\n\nLesson 1: Start Before You Are Ready. Lesson 2: Your First Customers Are Everything. Lesson 3: Quality Is Non-Negotiable. Lesson 4: Embrace Technology. Lesson 5: Stay True to Your Vision.\n\nAuthenticity is your greatest competitive advantage.`, image: '/images/fashion-show.jpg', category: 'Fashion', date: 'March 12, 2026', readTime: '6 min read', tags: 'Entrepreneurship,Fashion Business,Growth', featured: false, status: 'published' },
    { title: 'The Power of Collaboration: My Most Meaningful Partnerships', excerpt: 'Why working with other talented creatives has been the catalyst for some of my best work across music, fashion, and beyond.', content: `If there is one thing I have learned in my creative journey, it is this: collaboration multiplies talent.\n\nThe Daily Miracles album is a perfect example. Working with producer Salvage Beat brought a sonic dimension I could never have achieved alone.\n\nMy advice to every creative: find your tribe. Seek out people who challenge you, complement your skills, and share your values. Build a network before you need it, give more than you take, and always deliver on your promises.`, image: '/images/hero-portrait.jpg', category: 'Music', date: 'February 20, 2026', readTime: '5 min read', tags: 'Collaboration,Networking,Creative Growth', featured: false, status: 'published' },
  ];
  for (const p of posts) {
    await prisma.blogPost.upsert({ where: { id: posts.indexOf(p) + 1 }, update: p, create: p });
  }

  // Site content (editable CMS keys)
  const content = [
    { key: 'hero_headline', value: 'Exceptional Talent, Every Time' },
    { key: 'hero_subtext', value: 'Succeed Michael Lawani is a multi-talented creative force — a passionate musician, innovative fashion designer behind TheSucceedeer Designs, and a results-driven digital marketing expert.' },
    { key: 'fans_count', value: '50K+' },
    { key: 'streams_count', value: '1M+' },
    { key: 'campaigns_count', value: '500+' },
    { key: 'designs_count', value: '2,000+' },
    { key: 'brands_scaled', value: '50+' },
    { key: 'client_satisfaction', value: '98%' },
    { key: 'ad_spend_managed', value: '10M+' },
    { key: 'about_bio_1', value: 'A multi-talented creative force born in Lagos, Nigeria, Succeed Michael Lawani has dedicated his life to mastering the arts of music, fashion, and digital marketing. His journey from a young dreamer to an internationally recognized creative entrepreneur is nothing short of inspirational.' },
    { key: 'about_bio_2', value: 'With over 8 years of professional experience across multiple industries, Succeed has built a reputation for excellence, innovation, and an unwavering commitment to his craft.' },
    { key: 'phone', value: '+234 813 478 1588' },
    { key: 'email', value: 'hello@succeedlawani.com' },
    { key: 'location', value: 'Lagos, Nigeria' },
    { key: 'business_name', value: 'TheSucceedeer Designs & Digital Agency' },
    { key: 'instagram_url', value: '#' },
    { key: 'twitter_url', value: '#' },
    { key: 'youtube_url', value: '#' },
    { key: 'facebook_url', value: '#' },
    { key: 'faq_1_q', value: 'How far in advance should I book?' },
    { key: 'faq_1_a', value: 'For events and performances, at least 4-6 weeks in advance. For fashion orders, 2-3 weeks is ideal.' },
    { key: 'faq_2_q', value: 'Do you offer international shipping?' },
    { key: 'faq_2_a', value: 'Yes! TheSucceedeer Designs ships worldwide via DHL and FedEx with tracking.' },
    { key: 'faq_3_q', value: 'Can I get a custom song written?' },
    { key: 'faq_3_a', value: 'Absolutely. I create custom songs for weddings, anniversaries, corporate events, and special occasions.' },
    { key: 'faq_4_q', value: 'What marketing services do you offer?' },
    { key: 'faq_4_a', value: 'Facebook/Instagram Ads, Google Ads, SEO, content strategy, brand consulting, and training workshops.' },
  ];
  for (const c of content) {
    await prisma.siteContent.upsert({ where: { key: c.key }, update: { value: c.value }, create: c });
  }

  console.log('✅ All data seeded successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
