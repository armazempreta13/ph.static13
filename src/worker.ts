interface Env {
  ASSETS: Fetcher;
  PROMO_DB: KVNamespace;
  EMAIL_PROVIDER?: 'resend' | 'mailchannels';
  CONTACT_EMAIL_TO?: string;
  CONTACT_FROM_EMAIL?: string;
  CONTACT_FROM_NAME?: string;
  MAILCHANNELS_FROM_EMAIL?: string;
  RESEND_API_KEY?: string;
  ALLOWED_ORIGIN?: string;
}

interface EmailRequestPayload {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
}

interface ContactPayload {
  name: string;
  email: string;
  projectType: string;
  budget: string;
  message: string;
  leadId?: string | null;
}

interface ChatbotPayload {
  name: string;
  email: string;
  projectType: string;
  designStatus: string;
  targetAudience?: string;
  budgetRange?: string;
  timeline?: string;
  hasDomain?: string;
  functionalities?: string[];
  details?: string;
}

const json = (data: unknown, status = 200, headers: HeadersInit = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  });

const getCorsHeaders = (request: Request, env: Env) => {
  const origin = request.headers.get('Origin') || env.ALLOWED_ORIGIN || '*';

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };
};

const applySecurityHeaders = (response: Response, url: URL) => {
  const newResponse = new Response(response.body, response);

  newResponse.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  newResponse.headers.set('X-Content-Type-Options', 'nosniff');
  newResponse.headers.set('X-Frame-Options', 'DENY');
  newResponse.headers.set('X-XSS-Protection', '1; mode=block');
  newResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  newResponse.headers.set('Permissions-Policy', 'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()');
  newResponse.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  newResponse.headers.set('Cross-Origin-Resource-Policy', 'cross-origin');

  const cspHeader = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.cloudflareinsights.com https://cdn.jsdelivr.net https://unpkg.com https://www.googletagmanager.com https://www.google-analytics.com https://cdnjs.cloudflare.com https://cdn.tailwindcss.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; img-src 'self' data: https: blob:; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com data:; connect-src 'self' https: wss: https://cloudflareinsights.com; media-src 'self' https:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests;";
  newResponse.headers.set('Content-Security-Policy', cspHeader);

  if (url.pathname.match(/\.(js|css|woff2|png|jpg|jpeg|gif|svg|ico)$/i)) {
    newResponse.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  } else if (url.pathname === '/' || url.pathname.match(/\.html$/)) {
    newResponse.headers.set('Cache-Control', 'public, max-age=3600, must-revalidate');
  } else {
    newResponse.headers.set('Cache-Control', 'public, max-age=1800');
  }

  return newResponse;
};

const stripHtml = (input = '') => input.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

const sendWithResend = async (payload: EmailRequestPayload, env: Env) => {
  if (!env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY nao configurada no Worker.');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: `${env.CONTACT_FROM_NAME || 'PH.static'} <${env.CONTACT_FROM_EMAIL || env.CONTACT_EMAIL_TO}>`,
      to: Array.isArray(payload.to) ? payload.to : [payload.to],
      subject: payload.subject,
      html: payload.html,
      text: payload.text || stripHtml(payload.html || ''),
      reply_to: payload.replyTo
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Falha ao enviar e-mail via Resend: ${errorText}`);
  }
};

const sendWithMailChannels = async (payload: EmailRequestPayload, env: Env) => {
  const fromEmail = env.MAILCHANNELS_FROM_EMAIL || env.CONTACT_FROM_EMAIL || env.CONTACT_EMAIL_TO;

  if (!fromEmail) {
    throw new Error('MAILCHANNELS_FROM_EMAIL ou CONTACT_FROM_EMAIL nao configurado no Worker.');
  }

  const response = await fetch('https://api.mailchannels.net/tx/v1/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: (Array.isArray(payload.to) ? payload.to : [payload.to]).map((email) => ({ email }))
        }
      ],
      from: {
        email: fromEmail,
        name: env.CONTACT_FROM_NAME || 'PH.static'
      },
      reply_to: payload.replyTo ? { email: payload.replyTo } : undefined,
      subject: payload.subject,
      content: [
        {
          type: 'text/plain',
          value: payload.text || stripHtml(payload.html || '')
        },
        ...(payload.html
          ? [
              {
                type: 'text/html',
                value: payload.html
              }
            ]
          : [])
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Falha ao enviar e-mail via MailChannels: ${errorText}`);
  }
};

const sendEmail = async (payload: EmailRequestPayload, env: Env) => {
  const provider = env.EMAIL_PROVIDER || (env.RESEND_API_KEY ? 'resend' : 'mailchannels');

  if (provider === 'resend') {
    await sendWithResend(payload, env);
    return;
  }

  await sendWithMailChannels(payload, env);
};

import { 
  buildContactEmailHtml, 
  buildClientConfirmationHtml, 
  buildChatbotLeadHtml, 
  buildChatbotClientHtml,
  buildChatbotSummaryText
} from '../lib/emailTemplates.js';

const handleContactRequest = async (request: Request, env: Env) => {
  const payload = (await request.json()) as ContactPayload;

  if (!payload.name || !payload.email || !payload.projectType || !payload.message) {
    return json({ error: 'Campos obrigatorios ausentes no formulario de contato.' }, 400, getCorsHeaders(request, env));
  }

  if (!env.CONTACT_EMAIL_TO) {
    return json({ error: 'CONTACT_EMAIL_TO nao configurado no Worker.' }, 503, getCorsHeaders(request, env));
  }

  // Owner notification
  await sendEmail(
    {
      to: env.CONTACT_EMAIL_TO,
      subject: `Novo lead do site: ${payload.projectType} - ${payload.name}`,
      html: buildContactEmailHtml(payload),
      text: `Novo lead do site\nNome: ${payload.name}\nEmail: ${payload.email}\nInteresse: ${payload.projectType}\nInvestimento: ${payload.budget}\nMensagem: ${payload.message}`,
      replyTo: payload.email
    },
    env
  );

  // Customer confirmation
  await sendEmail(
    {
      to: payload.email,
      subject: 'Recebi sua mensagem - PH.static',
      html: buildClientConfirmationHtml(payload),
      text: `Recebi sua mensagem, ${payload.name}. Responderei em breve sobre o projeto ${payload.projectType}.`
    },
    env
  );

  return json({ success: true }, 200, getCorsHeaders(request, env));
};

const handleChatbotLeadRequest = async (request: Request, env: Env) => {
  const payload = (await request.json()) as ChatbotPayload;

  if (!payload.name || !payload.email || !payload.projectType) {
    return json({ error: 'Dados obrigatorios do briefing ausentes.' }, 400, getCorsHeaders(request, env));
  }

  if (!env.CONTACT_EMAIL_TO) {
    return json({ error: 'CONTACT_EMAIL_TO nao configurado no Worker.' }, 503, getCorsHeaders(request, env));
  }

  // Owner notification
  await sendEmail(
    {
      to: env.CONTACT_EMAIL_TO,
      subject: `Novo briefing do chatbot: ${payload.projectType} - ${payload.name}`,
      html: buildChatbotLeadHtml(payload),
      text: `Novo briefing do chatbot\n\n${buildChatbotSummaryText(payload)}`,
      replyTo: payload.email
    },
    env
  );

  // Customer confirmation
  await sendEmail(
    {
      to: payload.email,
      subject: 'Seu briefing foi recebido - PH.static',
      html: buildChatbotClientHtml(payload),
      text: `Seu briefing foi recebido com sucesso.\n\n${buildChatbotSummaryText(payload)}`
    },
    env
  );

  return json({ success: true }, 200, getCorsHeaders(request, env));
};

const handleEmailRequest = async (request: Request, env: Env) => {
  const payload = (await request.json()) as EmailRequestPayload;

  if (!payload.to || !payload.subject || (!payload.html && !payload.text)) {
    return json({ error: 'Payload de e-mail invalido.' }, 400, getCorsHeaders(request, env));
  }

  await sendEmail(payload, env);
  return json({ success: true }, 200, getCorsHeaders(request, env));
};

const handlePromoRequest = async (request: Request, env: Env) => {
  if (request.method === 'GET') {
    const claimsStr = await env.PROMO_DB.get('vagas_promo_v1');
    const claimedCount = claimsStr ? parseInt(claimsStr, 10) : 0;
    return json({ success: true, claimed: claimedCount, limit: 5 }, 200, getCorsHeaders(request, env));
  }

  if (request.method === 'POST') {
    const payload: { name: string; whatsapp: string } = await request.json();
    
    // Check current availability
    const claimsStr = await env.PROMO_DB.get('vagas_promo_v1');
    let claimedCount = claimsStr ? parseInt(claimsStr, 10) : 0;
    
    if (claimedCount >= 5) {
      return json({ success: false, error: 'As vagas da promoção esgotaram!' }, 403, getCorsHeaders(request, env));
    }

    // Increment and save
    claimedCount += 1;
    await env.PROMO_DB.put('vagas_promo_v1', claimedCount.toString());

    // Send owner notification
    if (env.CONTACT_EMAIL_TO) {
      await sendEmail(
        {
          to: env.CONTACT_EMAIL_TO,
          subject: `🔥 [PROMOÇÃO] Resgate: ${payload.name}`,
          html: `<p><strong>Novo Cupom Resgatado!</strong></p><p>Nome: ${payload.name}</p><p>WhatsApp: ${payload.whatsapp}</p><p>Restam: ${5 - claimedCount}/5</p>`,
          text: `Novo Resgate. Nome: ${payload.name}. WhatsApp: ${payload.whatsapp}. Restam: ${5 - claimedCount}/5`
        },
        env
      );
    }
    
    return json({ success: true, claimed: claimedCount, limit: 5 }, 200, getCorsHeaders(request, env));
  }

  return json({ error: 'Método não permitido.' }, 405, getCorsHeaders(request, env));
};

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: getCorsHeaders(request, env)
      });
    }

    if (url.pathname === '/api/contact' && request.method === 'POST') {
      try {
        return await handleContactRequest(request, env);
      } catch (error: any) {
        return json({ error: error?.message || 'Falha no endpoint de contato.' }, 500, getCorsHeaders(request, env));
      }
    }

    if (url.pathname === '/api/chatbot-lead' && request.method === 'POST') {
      try {
        return await handleChatbotLeadRequest(request, env);
      } catch (error: any) {
        return json({ error: error?.message || 'Falha no endpoint do chatbot.' }, 500, getCorsHeaders(request, env));
      }
    }

    if (url.pathname === '/api/promo') {
      try {
        return await handlePromoRequest(request, env);
      } catch (error: any) {
        return json({ error: error?.message || 'Falha no endpoint promocional.' }, 500, getCorsHeaders(request, env));
      }
    }

    if (url.pathname === '/api/email' && request.method === 'POST') {
      try {
        return await handleEmailRequest(request, env);
      } catch (error: any) {
        return json({ error: error?.message || 'Falha no endpoint de e-mail.' }, 500, getCorsHeaders(request, env));
      }
    }

    const response = await env.ASSETS.fetch(request);
    return applySecurityHeaders(response, url);
  }
};
