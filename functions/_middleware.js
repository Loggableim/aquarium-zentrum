import contentRoutes from '../data/public-content-routes.mjs';

/**
 * Pages Functions Middleware — Domain Redirect
 * Redirects aquarien-zentrum.com variants → aquaristik-zentrum.com
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

  if (redirectDomains.includes(host)) {
    url.hostname = 'aquaristik-zentrum.com';
    return Response.redirect(url.toString(), 301);
  }

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
      url.hostname = 'aquaristik-zentrum.com';
      url.pathname = target;
      return Response.redirect(url.toString(), 301);
    }
    return new Response('<!doctype html><html lang="de"><meta charset="utf-8"><title>Seite nicht gefunden</title><h1>Seite nicht gefunden</h1><p><a href="/">Zur Startseite</a></p></html>', {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex', 'Cache-Control': 'no-store' }
    });
  }

  // Continue serving normally for the main domain
  return context.next();
}
