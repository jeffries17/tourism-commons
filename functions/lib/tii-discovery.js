import { google } from 'googleapis';
import { getFirestore } from 'firebase-admin/firestore';
const customSearch = google.customsearch('v1');
function requireEnv(name) {
    const v = process.env[name];
    if (!v)
        throw new Error(`Missing env var: ${name}`);
    return v;
}
function extractDomain(url) {
    try {
        const u = new URL(url);
        return u.hostname.toLowerCase();
    }
    catch {
        return url.toLowerCase();
    }
}
function scoreWebsiteCandidate(domain, title, snippet) {
    let score = 0;
    const d = domain.toLowerCase();
    const text = `${title ?? ''} ${snippet ?? ''}`.toLowerCase();
    // Institutional-looking domains
    if (d.endsWith('.gov') || d.includes('.gov.'))
        score += 30;
    if (d.includes('tourism') || d.includes('travel') || d.includes('visit'))
        score += 20;
    if (d.includes('ministry') || d.includes('authority'))
        score += 10;
    // Hints from title/snippet
    if (text.includes('official'))
        score += 15;
    if (text.includes('tourism board') || text.includes('tourism authority') || text.includes('destination marketing')) {
        score += 15;
    }
    // Downweight obviously non-DMO sources like generic travel advisories
    if (d.includes('travel.state.gov'))
        score -= 60;
    return score;
}
function scoreInstagramCandidate(title, snippet) {
    let score = 0;
    const text = `${title ?? ''} ${snippet ?? ''}`.toLowerCase();
    if (text.includes('official'))
        score += 20;
    if (text.includes('tourism board') || text.includes('tourism authority') || text.includes('visit'))
        score += 15;
    if (text.includes('dmv') || text.includes('travel blogger') || text.includes('influencer'))
        score -= 10;
    return score;
}
function parseFollowersFromSnippet(snippet) {
    if (!snippet)
        return null;
    const text = snippet.replace(/[\u202f\u00a0]/g, ' '); // normalize thin/non‑breaking spaces
    const match = text.match(/([\d.,]+)\s*([kKmM])?\+?\s+followers/);
    if (!match)
        return null;
    const raw = match[1].replace(/,/g, '');
    const num = parseFloat(raw);
    if (Number.isNaN(num))
        return null;
    const suffix = match[2]?.toLowerCase();
    if (suffix === 'k')
        return Math.round(num * 1000);
    if (suffix === 'm')
        return Math.round(num * 1000000);
    return Math.round(num);
}
function parseVisitorsFromSnippet(snippet) {
    const text = snippet.replace(/[\u202f\u00a0]/g, ' ').toLowerCase();
    // Pattern A: "65 million international visitors in 2024" or "60 million tourists per year (2024)"
    const reA = /([\d.,]+)\s*(thousand|million|billion)?\s+(?:international\s+)?(?:tourists?|visitors?|tourist arrivals?|non-resident tourist arrivals?)[^0-9]{0,40}?(20\d{2})/g;
    // Pattern B: "In 2024, 37.40 million people visited Germany"
    const reB = /(20\d{2})[^0-9]{0,40}([\d.,]+)\s*(thousand|million|billion)?\s+(?:people\s+visited|visitors\s+visited|tourists\s+visited)/g;
    let best = null;
    function consider(year, value) {
        if (!year || year < 2010)
            return;
        const rounded = Math.round(value);
        if (!best || year > best.year || (year === best.year && rounded > best.value)) {
            best = { value: rounded, year };
        }
    }
    for (const match of text.matchAll(reA)) {
        const raw = match[1].replace(/,/g, '');
        const num = parseFloat(raw);
        if (Number.isNaN(num))
            continue;
        const scale = match[2];
        let value = num;
        if (scale === 'thousand')
            value = num * 1000;
        else if (scale === 'million')
            value = num * 1000000;
        else if (scale === 'billion')
            value = num * 1000000000;
        const year = parseInt(match[3], 10);
        consider(year, value);
    }
    for (const match of text.matchAll(reB)) {
        const year = parseInt(match[1], 10);
        const raw = match[2].replace(/,/g, '');
        const num = parseFloat(raw);
        if (Number.isNaN(num))
            continue;
        const scale = match[3];
        let value = num;
        if (scale === 'thousand')
            value = num * 1000;
        else if (scale === 'million')
            value = num * 1000000;
        else if (scale === 'billion')
            value = num * 1000000000;
        consider(year, value);
    }
    return best;
}
async function runSearchPack(apiKey, cx, queries) {
    const results = [];
    for (const q of queries) {
        const res = await customSearch.cse.list({
            auth: apiKey,
            cx,
            q,
            num: 5,
        });
        if (res.data.items) {
            results.push(...res.data.items);
        }
    }
    return results;
}
async function discoverForDestination(apiKey, cx, dest) {
    const websiteQueries = [
        `${dest.name} tourism board official website`,
        `${dest.name} tourism authority official site`,
        `Visit ${dest.name} official website`,
        `${dest.name} DMO official website`,
        `site:.gov "${dest.name}" tourism`,
        `site:.org "${dest.name}" tourism authority`,
    ];
    const instagramQueries = [
        `${dest.name} tourism instagram official`,
        `Visit ${dest.name} instagram`,
        `${dest.name} tourism board instagram`,
        `${dest.name} tourism authority instagram`,
    ];
    const linkEvidenceQueries = [
        // These will be refined later; start simple
        `site:instagram.com "${dest.name}" "visit" "official"`,
    ];
    const [websiteResults, instagramResults, linkResults] = await Promise.all([
        runSearchPack(apiKey, cx, websiteQueries),
        runSearchPack(apiKey, cx, instagramQueries),
        runSearchPack(apiKey, cx, linkEvidenceQueries),
    ]);
    const websiteCandidates = new Map();
    const instagramCandidates = new Map();
    function addWebsiteCandidate(item, source) {
        if (!item.link)
            return;
        const domain = extractDomain(item.link);
        // Ignore Instagram URLs as website candidates – they should be treated only as IG profiles
        if (domain.includes('instagram.com'))
            return;
        const existing = websiteCandidates.get(domain);
        const baseScore = scoreWebsiteCandidate(domain, item.title ?? undefined, item.snippet ?? undefined);
        const extra = 5; // per appearance
        const score = (existing?.score ?? 0) + baseScore + extra;
        const sources = existing ? [...existing.sources, source] : [source];
        websiteCandidates.set(domain, { url: item.link, domain, score, sources });
    }
    function addInstagramCandidate(item, source) {
        if (!item.link)
            return;
        const url = item.link;
        const domain = extractDomain(url);
        if (!domain.includes('instagram.com'))
            return;
        const afterHost = url.split('instagram.com/')[1] || '';
        const path = afterHost.split(/[?#]/)[0];
        const segments = path.split('/').filter(Boolean);
        const first = segments[0];
        // Ignore non-profile URLs like posts/reels/explore
        if (!first)
            return;
        const blocked = ['p', 'reel', 'reels', 'explore', 'stories', 'tv'];
        if (blocked.includes(first.toLowerCase()))
            return;
        const handle = first;
        if (!handle)
            return;
        const key = handle.toLowerCase();
        const existing = instagramCandidates.get(key);
        const baseScore = scoreInstagramCandidate(item.title ?? undefined, item.snippet ?? undefined);
        const extra = 5;
        const score = (existing?.score ?? 0) + baseScore + extra;
        const sources = existing ? [...existing.sources, source] : [source];
        instagramCandidates.set(key, { handle, url, score, sources });
    }
    websiteResults.forEach((item) => addWebsiteCandidate(item, 'website-pack'));
    instagramResults.forEach((item) => addInstagramCandidate(item, 'instagram-pack'));
    linkResults.forEach((item) => {
        addWebsiteCandidate(item, 'link-pack');
        addInstagramCandidate(item, 'link-pack');
    });
    const topWebsite = Array.from(websiteCandidates.values()).sort((a, b) => b.score - a.score)[0];
    const topInstagram = Array.from(instagramCandidates.values()).sort((a, b) => b.score - a.score)[0];
    const db = getFirestore();
    // Upsert destination
    const destRef = db.collection('destinations').doc(dest.id);
    await destRef.set({
        name: dest.name,
        type: 'country',
        countryCode: dest.countryCode,
        continent: dest.continent,
        region: dest.region ?? null,
    }, { merge: true });
    // Upsert tourism profile (single primary profile per destination for now)
    const profileRef = db.collection('tourismProfiles').doc(dest.id);
    await profileRef.set({
        destinationId: dest.id,
        officialWebsiteUrl: topWebsite?.url ?? null,
        websiteConfidence: topWebsite ? Math.min(100, topWebsite.score) : 0,
        instagramHandle: topInstagram?.handle ?? null,
        instagramUrl: topInstagram?.url ?? null,
        followers: null,
        followersLastChecked: null,
        verificationStatus: 'unverified',
        evidenceUrls: [
            ...(topWebsite ? topWebsite.sources.map(() => topWebsite.url) : []),
            ...(topInstagram ? topInstagram.sources.map(() => topInstagram.url) : []),
        ],
        lastReviewedBy: null,
        lastReviewedAt: null,
    }, { merge: true });
    return {
        destinationId: dest.id,
        website: topWebsite,
        instagram: topInstagram,
    };
}
async function refreshFollowersForProfile(apiKey, cx, handle, instagramUrl) {
    const queries = [
        `@${handle} instagram followers`,
        `${handle} instagram followers`,
        `"${handle}" instagram followers`,
    ];
    const results = await runSearchPack(apiKey, cx, queries);
    const normalizedProfileUrl = new URL(instagramUrl);
    const profilePath = normalizedProfileUrl.pathname.split(/[?#]/)[0];
    for (const item of results) {
        if (!item.link || !item.snippet)
            continue;
        try {
            const url = new URL(item.link);
            if (!url.hostname.includes('instagram.com'))
                continue;
            const path = url.pathname.split(/[?#]/)[0];
            // Require the search result to be the profile URL we already trust
            if (!path.startsWith(profilePath))
                continue;
        }
        catch {
            continue;
        }
        const followers = parseFollowersFromSnippet(item.snippet);
        if (followers != null) {
            return followers;
        }
    }
    return null;
}
// Small default list for early testing (used when no destinations are provided explicitly)
const defaultEuropeanDestinations = [
    { id: 'FR', name: 'France', countryCode: 'FR', continent: 'Europe', region: 'Western Europe' },
    { id: 'ES', name: 'Spain', countryCode: 'ES', continent: 'Europe', region: 'Southern Europe' },
    { id: 'IT', name: 'Italy', countryCode: 'IT', continent: 'Europe', region: 'Southern Europe' },
];
// Canonical list of European countries for Phase 1 (country layer)
const europeanCountries = [
    { id: 'AL', name: 'Albania', countryCode: 'AL', continent: 'Europe', region: 'Southern Europe' },
    { id: 'AD', name: 'Andorra', countryCode: 'AD', continent: 'Europe', region: 'Southern Europe' },
    { id: 'AT', name: 'Austria', countryCode: 'AT', continent: 'Europe', region: 'Western Europe' },
    { id: 'BE', name: 'Belgium', countryCode: 'BE', continent: 'Europe', region: 'Western Europe' },
    { id: 'BA', name: 'Bosnia and Herzegovina', countryCode: 'BA', continent: 'Europe', region: 'Southern Europe' },
    { id: 'BG', name: 'Bulgaria', countryCode: 'BG', continent: 'Europe', region: 'Eastern Europe' },
    { id: 'HR', name: 'Croatia', countryCode: 'HR', continent: 'Europe', region: 'Southern Europe' },
    { id: 'CY', name: 'Cyprus', countryCode: 'CY', continent: 'Europe', region: 'Southern Europe' },
    { id: 'CZ', name: 'Czechia', countryCode: 'CZ', continent: 'Europe', region: 'Central Europe' },
    { id: 'DK', name: 'Denmark', countryCode: 'DK', continent: 'Europe', region: 'Northern Europe' },
    { id: 'EE', name: 'Estonia', countryCode: 'EE', continent: 'Europe', region: 'Northern Europe' },
    { id: 'FI', name: 'Finland', countryCode: 'FI', continent: 'Europe', region: 'Northern Europe' },
    { id: 'FR', name: 'France', countryCode: 'FR', continent: 'Europe', region: 'Western Europe' },
    { id: 'DE', name: 'Germany', countryCode: 'DE', continent: 'Europe', region: 'Western Europe' },
    { id: 'GR', name: 'Greece', countryCode: 'GR', continent: 'Europe', region: 'Southern Europe' },
    { id: 'HU', name: 'Hungary', countryCode: 'HU', continent: 'Europe', region: 'Central Europe' },
    { id: 'IS', name: 'Iceland', countryCode: 'IS', continent: 'Europe', region: 'Northern Europe' },
    { id: 'IE', name: 'Ireland', countryCode: 'IE', continent: 'Europe', region: 'Western Europe' },
    { id: 'IT', name: 'Italy', countryCode: 'IT', continent: 'Europe', region: 'Southern Europe' },
    { id: 'LV', name: 'Latvia', countryCode: 'LV', continent: 'Europe', region: 'Northern Europe' },
    { id: 'LI', name: 'Liechtenstein', countryCode: 'LI', continent: 'Europe', region: 'Western Europe' },
    { id: 'LT', name: 'Lithuania', countryCode: 'LT', continent: 'Europe', region: 'Northern Europe' },
    { id: 'LU', name: 'Luxembourg', countryCode: 'LU', continent: 'Europe', region: 'Western Europe' },
    { id: 'MT', name: 'Malta', countryCode: 'MT', continent: 'Europe', region: 'Southern Europe' },
    { id: 'MD', name: 'Moldova', countryCode: 'MD', continent: 'Europe', region: 'Eastern Europe' },
    { id: 'MC', name: 'Monaco', countryCode: 'MC', continent: 'Europe', region: 'Western Europe' },
    { id: 'ME', name: 'Montenegro', countryCode: 'ME', continent: 'Europe', region: 'Southern Europe' },
    { id: 'NL', name: 'Netherlands', countryCode: 'NL', continent: 'Europe', region: 'Western Europe' },
    { id: 'MK', name: 'North Macedonia', countryCode: 'MK', continent: 'Europe', region: 'Southern Europe' },
    { id: 'NO', name: 'Norway', countryCode: 'NO', continent: 'Europe', region: 'Northern Europe' },
    { id: 'PL', name: 'Poland', countryCode: 'PL', continent: 'Europe', region: 'Central Europe' },
    { id: 'PT', name: 'Portugal', countryCode: 'PT', continent: 'Europe', region: 'Southern Europe' },
    { id: 'RO', name: 'Romania', countryCode: 'RO', continent: 'Europe', region: 'Eastern Europe' },
    { id: 'SM', name: 'San Marino', countryCode: 'SM', continent: 'Europe', region: 'Southern Europe' },
    { id: 'RS', name: 'Serbia', countryCode: 'RS', continent: 'Europe', region: 'Southern Europe' },
    { id: 'SK', name: 'Slovakia', countryCode: 'SK', continent: 'Europe', region: 'Central Europe' },
    { id: 'SI', name: 'Slovenia', countryCode: 'SI', continent: 'Europe', region: 'Southern Europe' },
    { id: 'ES', name: 'Spain', countryCode: 'ES', continent: 'Europe', region: 'Southern Europe' },
    { id: 'SE', name: 'Sweden', countryCode: 'SE', continent: 'Europe', region: 'Northern Europe' },
    { id: 'CH', name: 'Switzerland', countryCode: 'CH', continent: 'Europe', region: 'Western Europe' },
    { id: 'TR', name: 'Türkiye', countryCode: 'TR', continent: 'Europe', region: 'Southern Europe' },
    { id: 'UA', name: 'Ukraine', countryCode: 'UA', continent: 'Europe', region: 'Eastern Europe' },
    { id: 'GB', name: 'United Kingdom', countryCode: 'GB', continent: 'Europe', region: 'Northern Europe' },
];
async function discoverVisitorsForDestination(apiKey, cx, dest) {
    const targetYear = new Date().getFullYear() - 1; // last full calendar year
    const queries = [
        `visitors to ${dest.name} in ${targetYear}`,
        `${dest.name} visitors ${targetYear}`,
        `${dest.name} tourism visitors ${targetYear}`,
    ];
    const results = await runSearchPack(apiKey, cx, queries);
    let best = null;
    for (const item of results) {
        if (!item.snippet || !item.link)
            continue;
        const parsed = parseVisitorsFromSnippet(item.snippet);
        if (!parsed)
            continue;
        // Guard against obviously global or implausible numbers (e.g. 1.4 billion global arrivals)
        if (parsed.value > 300000000)
            continue;
        // Prefer the most recent year; ignore very old stats (< 2010) as obviously outdated
        if (parsed.year < 2010)
            continue;
        if (!best || parsed.year > best.parsed.year) {
            best = { parsed, link: item.link };
        }
    }
    if (!best)
        return null;
    const db = getFirestore();
    const seriesRef = db.collection('visitorSeries').doc(dest.id);
    await seriesRef.set({
        destinationId: dest.id,
        isPrimary: true,
        annualVisitorsValue: best.parsed.value,
        visitorYear: best.parsed.year,
        visitorMetricDefinition: 'Total visitors (approximate, parsed from web snippet)',
        visitorSourceUrl: best.link,
    }, { merge: true });
    return {
        value: best.parsed.value,
        year: best.parsed.year,
        definition: 'Total visitors (approximate, parsed from web snippet)',
        sourceUrl: best.link,
    };
}
async function debugVisitorsForDestination(apiKey, cx, dest) {
    const targetYear = new Date().getFullYear() - 1;
    const queries = [
        `visitors to ${dest.name} in ${targetYear}`,
        `${dest.name} visitors ${targetYear}`,
        `${dest.name} tourism visitors ${targetYear}`,
        `${dest.name} international visitors ${targetYear}`,
        `international visitors to ${dest.name} in ${targetYear}`,
    ];
    const resultsByQuery = [];
    for (const q of queries) {
        const items = await runSearchPack(apiKey, cx, [q]);
        const trimmed = (items || []).slice(0, 5).map((item) => ({
            title: item.title ?? null,
            snippet: item.snippet ?? null,
            link: item.link ?? null,
            parsed: item.snippet ? parseVisitorsFromSnippet(item.snippet) : null,
        }));
        resultsByQuery.push({ query: q, results: trimmed });
    }
    return {
        destination: dest,
        targetYear,
        queries: resultsByQuery,
    };
}
export function setupTiiRoutes(app) {
    app.post('/tii/discovery', async (req, res) => {
        try {
            const apiKey = requireEnv('GOOGLE_SEARCH_API_KEY');
            const cx = requireEnv('GOOGLE_SEARCH_CX');
            const bodyDestinations = req.body?.destinations || [];
            const destinations = bodyDestinations.length > 0 ? bodyDestinations : defaultEuropeanDestinations;
            const results = [];
            for (const dest of destinations) {
                const result = await discoverForDestination(apiKey, cx, dest);
                results.push(result);
            }
            res.json({
                ok: true,
                count: results.length,
                destinations: results,
            });
        }
        catch (e) {
            console.error('tii/discovery error', e);
            res.status(500).json({ error: e?.message ?? String(e) });
        }
    });
    app.post('/tii/refresh-followers', async (_req, res) => {
        try {
            const apiKey = requireEnv('GOOGLE_SEARCH_API_KEY');
            const cx = requireEnv('GOOGLE_SEARCH_CX');
            const db = getFirestore();
            const snap = await db
                .collection('tourismProfiles')
                .where('instagramHandle', '!=', null)
                .where('followers', '==', null)
                .limit(20) // conservative batch size for now; only profiles missing followers
                .get();
            const updates = [];
            for (const doc of snap.docs) {
                const data = doc.data();
                const handle = data.instagramHandle;
                const instagramUrl = data.instagramUrl;
                if (!handle || !instagramUrl)
                    continue;
                const followers = await refreshFollowersForProfile(apiKey, cx, handle, instagramUrl);
                if (followers != null) {
                    updates.push({ id: doc.id, followers });
                    await doc.ref.set({
                        followers,
                        followersLastChecked: new Date().toISOString(),
                    }, { merge: true });
                }
            }
            res.json({
                ok: true,
                updatedCount: updates.length,
                updates,
            });
        }
        catch (e) {
            console.error('tii/refresh-followers error', e);
            res.status(500).json({ error: e?.message ?? String(e) });
        }
    });
    app.post('/tii/visitor-discovery', async (req, res) => {
        try {
            const apiKey = requireEnv('GOOGLE_SEARCH_API_KEY');
            const cx = requireEnv('GOOGLE_SEARCH_CX');
            const bodyDestinations = req.body?.destinations || [];
            const destinations = bodyDestinations.length > 0 ? bodyDestinations : defaultEuropeanDestinations;
            const results = [];
            for (const dest of destinations) {
                const visitors = await discoverVisitorsForDestination(apiKey, cx, dest);
                results.push({ destinationId: dest.id, visitors });
            }
            res.json({
                ok: true,
                count: results.length,
                destinations: results,
            });
        }
        catch (e) {
            console.error('tii/visitor-discovery error', e);
            res.status(500).json({ error: e?.message ?? String(e) });
        }
    });
    app.post('/tii/visitor-debug', async (req, res) => {
        try {
            const apiKey = requireEnv('GOOGLE_SEARCH_API_KEY');
            const cx = requireEnv('GOOGLE_SEARCH_CX');
            const bodyDest = req.body?.destination;
            const dest = bodyDest ??
                defaultEuropeanDestinations.find((d) => d.id === req.body?.id) ??
                defaultEuropeanDestinations[0];
            const debug = await debugVisitorsForDestination(apiKey, cx, dest);
            res.json({ ok: true, ...debug });
        }
        catch (e) {
            console.error('tii/visitor-debug error', e);
            res.status(500).json({ error: e?.message ?? String(e) });
        }
    });
    // Temporary admin override endpoint for internal use.
    // In production this should be protected by proper auth/role checks.
    app.post('/tii/admin/update-destination', async (req, res) => {
        try {
            const db = getFirestore();
            const { destinationId, websiteUrl, instagramHandle, instagramUrl, followers, verificationStatus, visitorSeries, } = req.body;
            if (!destinationId) {
                return res.status(400).json({ error: 'destinationId is required' });
            }
            const profileRef = db.collection('tourismProfiles').doc(destinationId);
            const profileUpdate = {};
            if (websiteUrl !== undefined)
                profileUpdate.officialWebsiteUrl = websiteUrl;
            if (instagramHandle !== undefined)
                profileUpdate.instagramHandle = instagramHandle;
            if (instagramUrl !== undefined)
                profileUpdate.instagramUrl = instagramUrl;
            if (followers !== undefined)
                profileUpdate.followers = followers;
            if (verificationStatus)
                profileUpdate.verificationStatus = verificationStatus;
            if (Object.keys(profileUpdate).length > 0) {
                profileUpdate.lastReviewedAt = new Date().toISOString();
                await profileRef.set(profileUpdate, { merge: true });
            }
            if (visitorSeries) {
                const seriesRef = db.collection('visitorSeries').doc(destinationId);
                await seriesRef.set({
                    destinationId,
                    isPrimary: true,
                    annualVisitorsValue: visitorSeries.annualVisitorsValue,
                    visitorYear: visitorSeries.visitorYear,
                    visitorMetricDefinition: visitorSeries.visitorMetricDefinition,
                    visitorSourceUrl: visitorSeries.visitorSourceUrl ?? null,
                }, { merge: true });
            }
            res.json({ ok: true });
        }
        catch (e) {
            console.error('tii/admin/update-destination error', e);
            res.status(500).json({ error: e?.message ?? String(e) });
        }
    });
    // Batch helper: run discovery + visitor discovery for all European countries (country layer).
    // Followers can then be refreshed in one go via /tii/refresh-followers.
    app.post('/tii/run-europe-batch', async (_req, res) => {
        try {
            const apiKey = requireEnv('GOOGLE_SEARCH_API_KEY');
            const cx = requireEnv('GOOGLE_SEARCH_CX');
            const results = [];
            for (const dest of europeanCountries) {
                const discovery = await discoverForDestination(apiKey, cx, dest);
                const visitors = await discoverVisitorsForDestination(apiKey, cx, dest);
                results.push({ destinationId: dest.id, discovery, visitors });
            }
            res.json({
                ok: true,
                count: results.length,
                destinations: results,
            });
        }
        catch (e) {
            console.error('tii/run-europe-batch error', e);
            res.status(500).json({ error: e?.message ?? String(e) });
        }
    });
}
