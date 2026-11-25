import contentRoutes from '../data/public-content-routes.mjs';

/**
 * Pages Functions Middleware — Domain Redirect + URL-Konsolidierung (Trailing Slash)
 * 1) Redirects aquarien-zentrum.com variants → aquaristik-zentrum.com
 * 2) Redirects .html- und extensionslose Artikel-URLs per 301 auf die kanonische
 *    Trailing-Slash-URL (z. B. /artikel/x.html und /artikel/x → /artikel/x/)
 */
export async function onRequest(context) {
  const url = new URL(context.request.url);
  const host = url.hostname;

  // Domains that should redirect to main
  const redirectDomains = [
    'aquarien-zentrum.com',
    'www.aquarien-zentrum.com',
    'aquarienzentrum.com',
    'www.aquarienzentrum.com',
  ];

  let isRedirectDomain = redirectDomains.includes(host);

  // Source fragments and templates are build inputs, not standalone pages.
  // Decode before matching so encoded slashes/underscores cannot bypass this.
  let pathname = url.pathname;
  while (true) {
    try {
      const decoded = decodeURIComponent(pathname);
      if (decoded === pathname) break;
      pathname = decoded;
    } catch { break; }
  }
  pathname = pathname.replace(/\\/g, '/').replace(/\/+/g, '/');
  const segments = [];
  for (const segment of pathname.split('/')) {
    if (segment === '..') segments.pop();
    else if (segment && segment !== '.') segments.push(segment);
  }
  pathname = '/' + segments.join('/');
  const key = pathname.replace(/\/$/, '').replace(/\.html$/, '');
  if (key === '/content' || key.startsWith('/content/') || key === '/_templates' || key.startsWith('/_templates/')) {
    const target = contentRoutes[key];
    if (target) {
      // Canonicalize the target to its trailing-slash URL.
      const targetUrl = new URL(url.toString());
      targetUrl.hostname = 'aquaristik-zentrum.com';
      targetUrl.pathname = target.endsWith('/') ? target : `${target}/`;
      return Response.redirect(targetUrl.toString(), 301);
    }
    return new Response('<!doctype html><html lang="de"><meta charset="utf-8"><title>Seite nicht gefunden</title><h1>Seite nicht gefunden</h1><p><a href="/">Zur Startseite</a></p></html>', {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex', 'Cache-Control': 'no-store' }
    });
  }

  // URL consolidation: every page URL without a trailing slash redirects 301
  // to the same URL with a trailing slash.
  // - /artikel/foo.html → /artikel/foo/
  // - /artikel/foo      → /artikel/foo/
  // - /about.html       → /about/
  // - /artikel          → /artikel/
  // Assets (images, css, js, fonts, sitemap, robots, ads.txt, data files,
  // anything with an extension) keep serving as-is.
  const lastSegment = segments[segments.length - 1] || '';
  const assetExtension = /\.(?:png|jpe?g|webp|gif|svg|ico|css|js|mjs|json|xml|txt|webmanifest|pdf|woff2?|ttf|map)$/i;
  const isPageLike = !assetExtension.test(lastSegment) || /\.html?$/i.test(lastSegment);
  if (segments.length > 0 && !pathname.endsWith('/') && isPageLike) {
    const canonicalPathname = `/${segments.map(s => s.replace(/\.html?$/i, '')).join('/')}/`;
    const target = new URL(url.toString());
    if (isRedirectDomain) target.hostname = 'aquaristik-zentrum.com';
    target.pathname = canonicalPathname;
    // Preserve query strings (e.g. ?q=) across the redirect.
    target.search = url.search;
    return Response.redirect(target.toString(), 301);
  }

  if (isRedirectDomain) {
    url.hostname = 'aquaristik-zentrum.com';
    return Response.redirect(url.toString(), 301);
  }

  // Continue serving normally for the main domain
  return context.next();
}
