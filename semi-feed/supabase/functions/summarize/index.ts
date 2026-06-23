const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

function extractTitle(html: string): string {
  const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return m ? m[1].trim() : '';
}

function guessTagsFromUrl(url: string): string[] {
  const lower = url.toLowerCase();
  const tagMap: Record<string, string> = {
    hbm: '#HBM',
    nand: '#NAND',
    dram: '#DRAM',
    ssd: '#SSD',
    oled: '#OLED',
    lcd: '#LCD',
    microled: '#MicroLED',
    semiconductor: '#반도체',
    memory: '#메모리',
    display: '#디스플레이',
    samsung: '#삼성',
    hynix: '#SK하이닉스',
    ai: '#AI',
  };
  return Object.entries(tagMap)
    .filter(([key]) => lower.includes(key))
    .map(([, tag]) => tag)
    .slice(0, 5);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(JSON.stringify({ error: 'url is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let title = '';
    let summary = '';

    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SemiFeed/1.0)' },
        signal: AbortSignal.timeout(8000),
      });
      const html = await res.text();

      title =
        extractMeta(html, 'og:title') ||
        extractMeta(html, 'twitter:title') ||
        extractTitle(html) ||
        url;

      summary =
        extractMeta(html, 'og:description') ||
        extractMeta(html, 'twitter:description') ||
        extractMeta(html, 'description') ||
        '';
    } catch (_) {
      title = new URL(url).hostname;
      summary = '';
    }

    const tags = guessTagsFromUrl(url);

    return new Response(
      JSON.stringify({ title: title.slice(0, 100), summary: summary.slice(0, 300), tags }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
