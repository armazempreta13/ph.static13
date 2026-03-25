/**
 * Cloudflare Workers Bootstrap
 * Adds security headers and request handling
 */

export default {
  async fetch(request: Request, env: any, ctx: any) {
    // Get the request URL
    const url = new URL(request.url);

    // Handle requests
    const response = await env.ASSETS.fetch(request);

    // Create a new response with enhanced security headers
    const newResponse = new Response(response.body, response);

    // Add/Override Security Headers
    newResponse.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    newResponse.headers.set('X-Content-Type-Options', 'nosniff');
    newResponse.headers.set('X-Frame-Options', 'DENY');
    newResponse.headers.set('X-XSS-Protection', '1; mode=block');
    newResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    newResponse.headers.set('Permissions-Policy', 'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()');
    newResponse.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
    newResponse.headers.set('Cross-Origin-Resource-Policy', 'cross-origin');
    
    // Content Security Policy - Remove unsafe directives for better security
    const cspHeader = "default-src 'self'; script-src 'self' https://cdn.jsdelivr.net https://unpkg.com https://www.googletagmanager.com https://www.google-analytics.com https://cdnjs.cloudflare.com; style-src 'self' https://fonts.googleapis.com https://cdnjs.cloudflare.com; img-src 'self' data: https: blob:; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com data:; connect-src 'self' https: wss:; media-src 'self' https:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests;";
    newResponse.headers.set('Content-Security-Policy', cspHeader);

    // Cache settings
    if (url.pathname.match(/\.(js|css|woff2|png|jpg|jpeg|gif|svg|ico)$/i)) {
      newResponse.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (url.pathname === '/' || url.pathname.match(/\.html$/)) {
      newResponse.headers.set('Cache-Control', 'public, max-age=3600, must-revalidate');
    } else {
      newResponse.headers.set('Cache-Control', 'public, max-age=1800');
    }

    return newResponse;
  }
};
