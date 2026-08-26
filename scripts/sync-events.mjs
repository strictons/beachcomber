#!/usr/bin/env node
// Syncs the Beachcomber Hotel & Resort's public "What's On" page
// (https://beachcomberhotelandresort.com.au/whats-on/) into src/data/events.ts,
// which powers the Live Entertainment page. Pulls all four tabs from that
// page: Featured Events, Weekly Events, Live Entertainment and Live Sports.
//
// Run with: npm run sync-events

import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = 'https://beachcomberhotelandresort.com.au';
const EVENTS_API = `${SITE}/wp-json/tribe/events/v1/events`;
const PAGES_API = `${SITE}/wp-json/wp/v2/pages`;
const MEDIA_API = `${SITE}/wp-json/wp/v2/media`;
const WHATS_ON_SLUG = 'whats-on';
const PER_PAGE = 50;
const OUTPUT_PATH = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/data/events.ts');

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed: ${res.status} ${res.statusText} (${url})`);
  return res.json();
}

// ---------------------------------------------------------------------------
// Tribe Events Calendar — used only to cross-check whether a "Featured Events"
// card parsed off the page (below) links to an event whose real end date has
// already passed, in case the page itself falls behind.
// ---------------------------------------------------------------------------

async function fetchTribeEvents() {
  const now = new Date();
  const windowStart = new Date(now);
  windowStart.setDate(windowStart.getDate() - 60);
  const oneYearOut = new Date(now);
  oneYearOut.setFullYear(oneYearOut.getFullYear() + 1);

  const events = [];
  let page = 1;
  let totalPages = 1;

  do {
    const url = `${EVENTS_API}?${new URLSearchParams({
      page: String(page),
      per_page: String(PER_PAGE),
      start_date: isoDate(windowStart),
      end_date: isoDate(oneYearOut),
      status: 'publish',
    })}`;
    const data = await fetchJson(url);
    events.push(...data.events);
    totalPages = data.total_pages;
    page += 1;
  } while (page <= totalPages);

  return events;
}

/** Maps an event's own page URL to its end date, for the expiry cross-check above. */
function buildEndDateByUrl(tribeEvents) {
  const map = new Map();
  for (const e of tribeEvents) map.set(e.url, e.end_date.slice(0, 10));
  return map;
}

// ---------------------------------------------------------------------------
// HTML / shortcode text cleanup
// ---------------------------------------------------------------------------

const NAMED_ENTITIES = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  '#039': "'",
  nbsp: ' ',
};

/** Decodes the numeric/named HTML entities WordPress leaves in titles and stripped descriptions. */
function decodeEntities(str) {
  return str
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&(amp|lt|gt|quot|apos|#039|nbsp);/g, (_, name) => NAMED_ENTITIES[name]);
}

/** Strips WPBakery page-builder shortcodes, e.g. `[vc_row]<p>text</p>[/vc_row]`, down to plain text. */
function cleanDescription(html) {
  return decodeEntities(html.replace(/\[[^\]]*\]/g, ' ').replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// WPBakery shortcode attributes on this site are quoted with the HTML entity
// for a right double quotation mark (&#8221;) — except wptexturize rewrites
// that entity into a "prime" mark (&#8243;) whenever it immediately follows a
// digit (its "12 inches" heuristic misfiring on things like `image="3327"`),
// so a value ending in a digit is closed with &#8243; instead. Every match
// below has to accept either.
const CLOSE_QUOTE = '(?:&#8221;|&#8243;)';

// ---------------------------------------------------------------------------
// "What's On" page content — Featured Events / Weekly Events / Live
// Entertainment / Live Sports tabs, as WPBakery `[ld_tab_section]` shortcodes.
// ---------------------------------------------------------------------------

async function fetchWhatsOnContent() {
  const [page] = await fetchJson(`${PAGES_API}?slug=${WHATS_ON_SLUG}`);
  if (!page) throw new Error(`No published page found with slug "${WHATS_ON_SLUG}"`);
  return page.content.rendered;
}

function extractTabSection(pageHtml, tabTitle) {
  const re = new RegExp(
    `\\[ld_tab_section[^\\]]*title=&#8221;${escapeRegExp(tabTitle)}${CLOSE_QUOTE}[^\\]]*\\]([\\s\\S]*?)\\[/ld_tab_section\\]`
  );
  const m = pageHtml.match(re);
  if (!m) throw new Error(`Couldn't find a "${tabTitle}" tab on the What's On page — its layout may have changed.`);
  return m[1];
}

function extractColumnCards(sectionHtml) {
  const blocks = [];
  const re = /\[vc_column_inner[^\]]*\]([\s\S]*?)\[\/vc_column_inner\]/g;
  let m;
  while ((m = re.exec(sectionHtml))) blocks.push(m[1]);
  return blocks;
}

/** Parses one `[vc_single_image]` + `[vc_column_text]<strong>Title</strong>...body` + optional `[ld_button]` tile. */
function parseCard(block) {
  const imageMatch = block.match(new RegExp(`\\[vc_single_image image=&#8221;(\\d+)${CLOSE_QUOTE}`));
  const textMatch = block.match(/\[vc_column_text\]([\s\S]*?)\[\/vc_column_text\]/);
  const linkMatch = block.match(new RegExp(`\\[ld_button[^\\]]*link=&#8221;([^&]+?)${CLOSE_QUOTE}`));

  let title = '';
  let description = '';
  if (textMatch) {
    const raw = textMatch[1];
    const strongMatch = raw.match(/<strong>([\s\S]*?)<\/strong>/);
    title = strongMatch ? decodeEntities(strongMatch[1]).trim() : '';
    description = cleanDescription(strongMatch ? raw.replace(strongMatch[0], '') : raw);
  }

  let url = null;
  if (linkMatch) {
    const urlPart = linkMatch[1].match(/^url:([^|]*)/);
    if (urlPart) url = decodeURIComponent(urlPart[1]);
  }

  return { imageId: imageMatch ? Number(imageMatch[1]) : null, title, description, url };
}

function extractIframeSrcs(sectionHtml) {
  const srcs = [];
  const re = /<iframe[^>]*\bsrc="([^"]+)"/g;
  let m;
  while ((m = re.exec(sectionHtml))) srcs.push(decodeEntities(m[1]));
  return srcs;
}

// ---------------------------------------------------------------------------
// Media
// ---------------------------------------------------------------------------

async function resolveImageUrls(imageIds) {
  const uniqueIds = [...new Set(imageIds.filter((id) => id != null))];
  const entries = await Promise.all(
    uniqueIds.map(async (id) => {
      const media = await fetchJson(`${MEDIA_API}/${id}`);
      const url = media.media_details?.sizes?.medium?.source_url ?? media.source_url ?? null;
      return [id, url];
    })
  );
  return new Map(entries);
}

// ---------------------------------------------------------------------------
// Assembly
// ---------------------------------------------------------------------------

function renderModule(data, generatedAt) {
  return `// AUTO-GENERATED by scripts/sync-events.mjs — do not edit directly.
// Run \`npm run sync-events\` to refresh from beachcomberhotelandresort.com.au/whats-on/.
// Last synced: ${generatedAt}

export interface FeaturedEvent {
  title: string;
  /** Plain text, stripped of the source page-builder markup. */
  description: string;
  image: string | null;
  /** Booking / more-info link, when the tile has one. */
  url: string | null;
}

export interface WeeklyEvent {
  title: string;
  description: string;
  image: string | null;
}

export interface LiveSportsWidgets {
  /** Small "what's on now" carousel embed. */
  carouselUrl: string;
  /** Full fixtures/results widget embed. */
  fullUrl: string;
}

export const featuredEvents: FeaturedEvent[] = ${JSON.stringify(data.featuredEvents, null, 2)};

export const weeklyEvents: WeeklyEvent[] = ${JSON.stringify(data.weeklyEvents, null, 2)};

/** The venue's live-music booking widget (surreal.live), embedded as-is. */
export const liveEntertainmentWidgetUrl: string = ${JSON.stringify(data.liveEntertainmentWidgetUrl)};

export const liveSportsWidgets: LiveSportsWidgets = ${JSON.stringify(data.liveSportsWidgets, null, 2)};
`;
}

async function main() {
  const [pageHtml, tribeEvents] = await Promise.all([fetchWhatsOnContent(), fetchTribeEvents()]);
  const endDateByUrl = buildEndDateByUrl(tribeEvents);
  const today = isoDate(new Date());

  const featuredCards = extractColumnCards(extractTabSection(pageHtml, 'Featured Events')).map(parseCard);
  const weeklyCards = extractColumnCards(extractTabSection(pageHtml, 'Weekly Events')).map(parseCard);

  const imageUrls = await resolveImageUrls([...featuredCards, ...weeklyCards].map((c) => c.imageId));

  const featuredEvents = featuredCards
    .filter((c) => {
      const knownEndDate = c.url ? endDateByUrl.get(c.url) : undefined;
      return !knownEndDate || knownEndDate >= today;
    })
    .map((c) => ({
      title: c.title,
      description: c.description,
      image: c.imageId != null ? (imageUrls.get(c.imageId) ?? null) : null,
      url: c.url,
    }));

  const weeklyEvents = weeklyCards.map((c) => ({
    title: c.title,
    description: c.description,
    image: c.imageId != null ? (imageUrls.get(c.imageId) ?? null) : null,
  }));

  const liveEntertainmentSrcs = extractIframeSrcs(extractTabSection(pageHtml, 'Live Entertainment'));
  const liveSportsSrcs = extractIframeSrcs(extractTabSection(pageHtml, 'Live Sports'));
  if (liveEntertainmentSrcs.length === 0) throw new Error('No Live Entertainment widget iframe found on the page.');
  if (liveSportsSrcs.length < 2) throw new Error('Expected two Live Sports widget iframes on the page.');

  const data = {
    featuredEvents,
    weeklyEvents,
    liveEntertainmentWidgetUrl: liveEntertainmentSrcs[0],
    liveSportsWidgets: { carouselUrl: liveSportsSrcs[0], fullUrl: liveSportsSrcs[1] },
  };

  await writeFile(OUTPUT_PATH, renderModule(data, new Date().toISOString()));
  console.log(
    `Synced ${featuredEvents.length} featured event(s), ${weeklyEvents.length} weekly event(s) and both widget tabs → ${path.relative(process.cwd(), OUTPUT_PATH)}`
  );
}

main().catch((err) => {
  console.error('What\'s On sync failed:', err.message);
  process.exitCode = 1;
});
