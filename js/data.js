// Content lives here so the client can edit projects/services without touching layout code.
const img = (n) => `assets/img/${n}.jpg`;

export const CATEGORIES = [
  { id: 'branding', label: 'Branding', icon: '<path d="M4 20 12 4l8 16M7.5 13h9"/>' },
  { id: 'packaging', label: 'Packaging', icon: '<path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5zM3 7.5 12 12l9-4.5M12 12v9"/>' },
  { id: 'social', label: 'Social & ads', icon: '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="m3 15 5-5 4 4 3-3 6 6"/><circle cx="16" cy="8" r="1.5"/>' },
  { id: 'web', label: 'Digital', icon: '<rect x="2.5" y="4" width="19" height="14" rx="2"/><path d="M2.5 8h19M8 21h8"/>' },
  { id: 'motion', label: 'Motion & film', icon: '<rect x="3" y="5" width="13" height="14" rx="2"/><path d="m16 10 5-3v10l-5-3"/>' },
];

export const PROJECTS = [
  {
    client: 'Toyota', title: 'Rethink Traffic', cat: 'social', catLabel: 'Social campaign',
    tags: ['Campaign', 'Key visual', 'CGI'],
    desc: 'A wildlife-meets-highway campaign that flips the idea of a traffic jam on its head — buffaloes, elephants and deer become the “traffic” the Fortuner rolls through.',
    images: [img('toyota-ad'), img('toyota-1'), img('toyota-2'), img('toyota-3'), img('toyota-4')],
  },
  {
    client: 'Hangyo', title: 'Gourmet Select', cat: 'social', catLabel: 'Social & ads',
    tags: ['Social posts', 'Festive', 'Product'],
    desc: 'Indulgent, colour-drenched social creatives for Hangyo’s gourmet range — from Berry & Cream bars to Diwali specials.',
    images: [img('hangyo-main'), img('hangyo-berry'), img('hangyo-diwali'), img('hangyo-hazelnut')],
  },
  {
    client: 'Ching’s Secret', title: 'Whatever you got, make it hot', cat: 'social', catLabel: 'Key visual',
    tags: ['Key visual', 'Food CGI'],
    desc: 'A fiery key visual for Ching’s Chilli Oil — heat, splash and spice in one frame.',
    images: [img('chings')],
  },
  {
    client: 'goIndiGo', title: 'Saver Fare & Destinations', cat: 'web', catLabel: 'Digital campaign',
    tags: ['Web banners', 'Social', 'Video'],
    desc: 'A digital campaign system for goIndiGo — web banners, media creatives and destination films that make flying feel like a holiday already.',
    images: [img('indigo-dest'), img('indigo-banner'), img('indigo-honeymoon'), img('indigo-carry'), img('indigo-media'), img('indigo-wide')],
  },
  {
    client: 'Jaipore', title: 'Perfume packaging', cat: 'packaging', catLabel: 'Packaging design',
    tags: ['Packaging', 'Bottle label'],
    desc: 'A sunrise-gold perfume pack that carries the warmth of Jaipur onto the shelf.',
    images: [img('jaipore')],
  },
  {
    client: 'Vrindaam', title: 'Surya Aikyam', cat: 'packaging', catLabel: 'Packaging design',
    tags: ['Packaging', 'Illustration', 'Gift kit'],
    desc: 'Ayurvedic packaging rooted in Indian folk art — a sun-led illustration system across boxes, gift kits and labels.',
    images: [img('vrindaam-surya'), img('vrindaam-kit'), img('vrindaam-vanam'), img('vrindaam-kit2')],
  },
  {
    client: 'Vrindaam', title: 'Ayurvedic oils', cat: 'motion', catLabel: 'Content production',
    tags: ['Product shoot', 'CGI', 'Content'],
    desc: 'Studio-grade product visuals for Vrindaam’s oil range — lush, natural sets that let each bottle breathe.',
    images: [img('vrindaam-adiyoga'), img('vrindaam-kailash'), img('vrindaam-awadh'), img('vrindaam-chandrakanti'), img('vrindaam-oils')],
  },
  {
    client: 'Vrindaam', title: 'Skincare product CGI', cat: 'packaging', catLabel: 'Product CGI',
    tags: ['Hyperreal CGI', 'Banner'],
    desc: 'Hyper-realistic product renders and launch banners for Vrindaam’s skincare range — serums, lip care and more.',
    images: [img('lipcare-2'), img('lipcare-1'), img('lipcare-banner')],
  },
  {
    client: 'Vi', title: 'Spiral notebook', cat: 'branding', catLabel: 'Print & merch',
    tags: ['Print', 'Illustration'],
    desc: 'An everyday-inspiration notebook for the classroom, illustrated with icons who shaped India.',
    images: [img('vi-notebook')],
  },
  {
    client: 'Melorra', title: 'Range-focussed', cat: 'social', catLabel: 'Social ads',
    tags: ['Jewellery', 'Performance ads'],
    desc: 'Crisp, geometric ad creatives that let Melorra’s diamonds do the talking.',
    images: [img('melorra')],
  },
  {
    client: 'Sushupti', title: 'Sleep reels', cat: 'motion', catLabel: 'Motion & film',
    tags: ['Reels', 'Direction', 'Edit'],
    desc: 'A series of short-form reels on rest and recovery — scripted, shot and cut for the vertical screen.',
    video: 'assets/video/sushupti.mp4',
    images: [img('sushupti-1'), img('sushupti-2'), img('sushupti-3')],
  },
  {
    client: 'Symphony of Progress', title: 'Annual report', cat: 'branding', catLabel: 'Editorial design',
    tags: ['Annual report', 'Editorial'],
    desc: 'A corporate annual report with an editorial rhythm — data, story and design in step.',
    images: [img('annual-report')],
  },
];

const ico = (p) => `<svg class="svc__icon" viewBox="0 0 64 64">${p}</svg>`;
export const SERVICES = [
  { title: 'Brand Strategy & Naming', text: 'We don’t just name brands — we give them a personality.', tags: ['Positioning', 'Naming', 'Brand voice'],
    icon: ico('<circle cx="32" cy="32" r="22"/><circle cx="32" cy="32" r="12"/><circle class="acc" cx="32" cy="32" r="3"/><path class="acc" d="M32 4v10M32 50v10M4 32h10M50 32h10"/>') },
  { title: 'Logo & Visual Identity', text: 'Logos that don’t just look good — they feel right.', tags: ['Logo', 'Identity system', 'Guidelines'],
    icon: ico('<path d="M10 54 32 10l22 44z"/><path class="acc" d="M26 20 18 40l9-3 0 15 9-24-9 3z"/>') },
  { title: 'Packaging Design', text: 'Shelf-stopping packs that sell before anyone reads the label.', tags: ['Packaging', 'Labels', 'Product CGI'],
    icon: ico('<path d="M8 20 32 8l24 12v24L32 56 8 44z"/><path d="M8 20l24 12 24-12M32 32v24"/><path class="acc" d="m20 14 24 12v8"/>') },
  { title: 'Website Design', text: 'Interactive sites that load fast, scroll smooth and convert.', tags: ['UI / UX', 'Web design', 'Development'],
    icon: ico('<rect x="6" y="12" width="52" height="38" rx="4"/><path d="M6 21h52"/><path class="acc" d="m24 32-6 5 6 5M40 32l6 5-6 5M35 29l-6 16"/>') },
  { title: 'Social & Ad Campaigns', text: 'Scroll-stopping posters, posts and campaigns built for the feed.', tags: ['Campaigns', 'Posters', 'Performance ads'],
    icon: ico('<path d="M10 26v12h8l18 12V14L18 26z"/><path class="acc" d="M44 24c4 4 4 12 0 16M50 18c8 8 8 20 0 28"/>') },
  { title: 'Pixels in Motion', text: '3D, motion, and vibes — activated.', tags: ['3D', 'Animation', 'Motion graphics'],
    icon: ico('<path d="M32 6 54 19v26L32 58 10 45V19z"/><path d="M10 19l22 13 22-13M32 32v26"/><circle class="acc" cx="32" cy="32" r="5"/>') },
  { title: 'Content Production', text: 'From shoots to post-production — content that belongs on a big screen (or at least your feed).', tags: ['Shoots', 'Reels', 'Post-production'],
    icon: ico('<rect x="6" y="18" width="38" height="30" rx="4"/><path d="m44 28 14-8v26l-14-8"/><circle class="acc" cx="25" cy="33" r="7"/>') },
  { title: 'Future-ready, tool-savvy', text: 'We speak fluent AI, so you don’t have to.', tags: ['AI workflows', 'Gen-AI visuals'],
    icon: ico('<rect x="16" y="16" width="32" height="32" rx="6"/><path d="M24 8v8M32 8v8M40 8v8M24 48v8M32 48v8M40 48v8M8 24h8M8 32h8M8 40h8M48 24h8M48 32h8M48 40h8"/><path class="acc" d="m30 24-6 10h8l-4 8 10-12h-8l4-6z"/>') },
];
