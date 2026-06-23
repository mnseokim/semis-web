const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RSS_SOURCES = [
  {
    url: 'https://news.samsungsemiconductor.com/kr/feed/',
    defaultSource: '공식블로그',
    company: '삼성',
  },
  {
    url: 'https://news.skhynix.co.kr/feed/',
    defaultSource: '공식블로그',
    company: 'SK하이닉스',
  },
];

const SAMSUNG_SITEMAP = 'https://semiconductor.samsung.com/sitemap.xml';
const SAMSUNG_BLOG_PREFIX = 'https://semiconductor.samsung.com/news-events/tech-blog/';

const KEYWORD_MAP: { keywords: string[]; top: string; sub: string }[] = [
  { keywords: ['hbm', 'high bandwidth memory'], top: '반도체', sub: 'HBM' },
  { keywords: ['nand', '낸드', 'flash memory', 'flash storage'], top: '반도체', sub: 'NAND' },
  { keywords: ['dram', '디램', 'lpddr', 'gddr'], top: '반도체', sub: 'DRAM' },
  { keywords: ['ssd', 'solid state', 'nvme', 'ufs'], top: '반도체', sub: 'SSD' },
  { keywords: ['oled', '올레드'], top: '디스플레이', sub: 'OLED' },
  { keywords: ['lcd'], top: '디스플레이', sub: 'LCD' },
  { keywords: ['microled', 'micro led', '마이크로led'], top: '디스플레이', sub: 'MicroLED' },
];

function detectCompany(title: string, url: string): string | null {
  const t = title.toLowerCase();
  const u = url.toLowerCase();
  if (t.includes('sk하이닉스') || t.includes('하이닉스') || u.includes('skhynix')) return 'SK하이닉스';
  if (t.includes('삼성') || u.includes('samsung')) return '삼성';
  return null;
}

function categorize(text: string): { top: string; sub: string } | null {
  const lower = text.toLowerCase();
  for (const { keywords, top, sub } of KEYWORD_MAP) {
    if (keywords.some((k) => lower.includes(k))) {
      return { top, sub };
    }
  }
  return null;
}

function extractMeta(html: string, property: string): string {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, 'i'),
    new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${property}["']`, 'i'),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m) return m[1].trim();
  }
  return '';
}

function extractTag(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return (m?.[1] ?? m?.[2] ?? '').trim();
}

function parseRssItems(xml: string) {
  const items: { title: string; link: string; description: string }[] = [];
  const blocks = xml.match(/<item>([\s\S]*?)<\/item>/gi) ?? [];
  for (const block of blocks) {
    items.push({
      title: extractTag(block, 'title'),
      link: extractTag(block, 'link'),
      description: extractTag(block, 'description').replace(/<[^>]+>/g, '').slice(0, 300),
    });
  }
  return items;
}

async function parseSitemapTechBlogUrls(): Promise<string[]> {
  const res = await fetch(SAMSUNG_SITEMAP, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SemiFeed/1.0)' },
    signal: AbortSignal.timeout(10000),
  });
  const xml = await res.text();
  const entries = xml.match(/<url>([\s\S]*?)<\/url>/gi) ?? [];
  const results: string[] = [];

  for (const entry of entries) {
    const loc = entry.match(/<loc>([^<]+)<\/loc>/)?.[1] ?? '';
    const lastmod = entry.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1] ?? '';
    if (!loc.startsWith(SAMSUNG_BLOG_PREFIX)) continue;
    // 30일 이내 글만
    if (lastmod) {
      const age = Date.now() - new Date(lastmod).getTime();
      if (age > 30 * 24 * 60 * 60 * 1000) continue;
    }
    results.push(loc);
  }
  return results;
}

async function fetchArticleMeta(url: string): Promise<{ title: string; summary: string } | null> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SemiFeed/1.0)' },
      signal: AbortSignal.timeout(8000),
    });
    const html = await res.text();
    const title = (
      extractMeta(html, 'og:title') ||
      html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ||
      ''
    ).replace(/\s*\|\s*Samsung.*$/i, '').trim();
    const summary = extractMeta(html, 'og:description') || extractMeta(html, 'description');
    if (!title) return null;
    return { title: title.slice(0, 200), summary: summary.slice(0, 300) };
  } catch {
    return null;
  }
}

async function upsertArticle(article: Record<string, unknown>) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/articles`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=ignore-duplicates',
    },
    body: JSON.stringify(article),
  });
  return res.ok;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  let inserted = 0;
  let skipped = 0;
  const errors: string[] = [];

  // 1. RSS 소스 (삼성 뉴스룸 + SK하이닉스)
  for (const source of RSS_SOURCES) {
    try {
      const res = await fetch(source.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SemiFeed/1.0)' },
        signal: AbortSignal.timeout(10000),
      });
      const xml = await res.text();
      const items = parseRssItems(xml);

      for (const item of items) {
        if (!item.link) continue;
        const cat = categorize(`${item.title} ${item.description}`);
        if (!cat) { skipped++; continue; }
        const company = detectCompany(item.title, item.link) ?? source.company;
        const ok = await upsertArticle({
          url: item.link,
          title: item.title.slice(0, 200),
          summary: item.description,
          tags: [],
          top_category: cat.top,
          sub_category: cat.sub,
          source_type: source.defaultSource,
          company,
        });
        ok ? inserted++ : skipped++;
      }
    } catch (e) {
      errors.push(`RSS ${source.url}: ${e}`);
    }
  }

  // 2. 삼성 기술 블로그 (sitemap 기반, 30일 이내)
  try {
    const blogUrls = await parseSitemapTechBlogUrls();
    for (const url of blogUrls) {
      const urlKeywords = url.replace(SAMSUNG_BLOG_PREFIX, '').replace(/-/g, ' ');
      const cat = categorize(urlKeywords);
      if (!cat) { skipped++; continue; }

      const meta = await fetchArticleMeta(url);
      if (!meta) { skipped++; continue; }

      const fullText = `${meta.title} ${meta.summary}`;
      const finalCat = categorize(fullText) ?? cat;

      const ok = await upsertArticle({
        url,
        title: meta.title,
        summary: meta.summary,
        tags: [],
        top_category: finalCat.top,
        sub_category: finalCat.sub,
        source_type: '기술아티클',
        company: '삼성',
      });
      ok ? inserted++ : skipped++;
    }
  } catch (e) {
    errors.push(`Sitemap: ${e}`);
  }

  return new Response(
    JSON.stringify({ inserted, skipped, errors }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});
