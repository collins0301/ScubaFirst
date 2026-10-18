// Picks Scuba First's most-viewed Instagram reels and writes data/reels.json for the website.
// Runs daily from .github/workflows/update-reels.yml. Needs two repository secrets:
//   IG_USER_ID       – the Instagram professional account ID (17841…)
//   IG_ACCESS_TOKEN  – a long-lived Facebook Page access token with instagram_basic + instagram_manage_insights
import { writeFile, readFile } from 'node:fs/promises';

const API = process.env.GRAPH_API || 'https://graph.facebook.com/v26.0';
const TOP_N = Number(process.env.REELS_TOP_N || 3);
const WINDOW_DAYS = Number(process.env.REELS_WINDOW_DAYS || 0); // 0 = all reels; e.g. 30 = only reels from the last 30 days
const OUT = new URL('../data/reels.json', import.meta.url);
const { IG_USER_ID, IG_ACCESS_TOKEN } = process.env;

if (!IG_USER_ID || !IG_ACCESS_TOKEN) {
  console.log('IG_USER_ID / IG_ACCESS_TOKEN not set yet. Leaving data/reels.json unchanged.');
  process.exit(0);
}

async function get(path, params = {}) {
  const url = new URL(path.startsWith('http') ? path : API + path);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  if (!url.searchParams.has('access_token')) url.searchParams.set('access_token', IG_ACCESS_TOKEN);
  const res = await fetch(url);
  const body = await res.json();
  if (!res.ok || body.error) throw new Error(`${path}: ${body.error?.message || res.status}`);
  return body;
}

async function listReels() {
  const reels = [];
  let page = await get(`/${IG_USER_ID}/media`, {
    fields: 'id,media_product_type,permalink,caption,timestamp,thumbnail_url',
    limit: '50',
  });
  for (let i = 0; i < 6 && page; i++) {
    reels.push(...page.data.filter(m => m.media_product_type === 'REELS'));
    page = page.paging?.next ? await get(page.paging.next) : null;
  }
  if (WINDOW_DAYS > 0) {
    const cutoff = Date.now() - WINDOW_DAYS * 864e5;
    return reels.filter(r => Date.parse(r.timestamp) >= cutoff);
  }
  return reels;
}

async function views(id) {
  // "views" is the current metric; older API versions call it "plays".
  for (const metric of ['views', 'plays', 'ig_reels_aggregated_all_plays_count']) {
    try {
      const r = await get(`/${id}/insights`, { metric });
      const v = r.data?.[0]?.values?.[0]?.value ?? r.data?.[0]?.total_value?.value;
      if (typeof v === 'number') return v;
    } catch { /* try the next metric name */ }
  }
  return 0;
}

const reels = await listReels();
const scored = [];
for (const r of reels) scored.push({ ...r, views: await views(r.id) });
scored.sort((a, b) => b.views - a.views);

const top = scored.slice(0, TOP_N).map(r => ({
  permalink: r.permalink,
  caption: (r.caption || '').split('\n')[0].slice(0, 90),
  views: r.views,
  posted: r.timestamp,
}));

if (!top.length) {
  console.log('No reels found. Leaving data/reels.json unchanged.');
  process.exit(0);
}

const prev = await readFile(OUT, 'utf8').catch(() => '');
const next = JSON.stringify({ updated: new Date().toISOString(), reels: top }, null, 2) + '\n';
const sameReels = prev && JSON.stringify(JSON.parse(prev).reels) === JSON.stringify(top);
await writeFile(OUT, next);
console.log(sameReels ? 'Top reels unchanged (view counts refreshed).' : 'Top reels updated:', top.map(t => `${t.views} ${t.permalink}`).join(' | '));
