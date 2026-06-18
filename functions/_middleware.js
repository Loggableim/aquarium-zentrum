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

  // Continue serving normally for the main domain
  return context.next();
}
