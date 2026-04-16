import 'dotenv/config';
import { createServer } from 'node:http';
import { createReadStream, existsSync } from 'node:fs';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, 'dist');
const port = Number(process.env.PORT || 8788);

const requiredEnv = ['SMTP_USER', 'SMTP_PASS'];

const getMissingEnv = () => requiredEnv.filter((key) => !process.env[key]);

const getTransporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true' || Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

const json = (res, status, data) => {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
};

const readBody = (req) =>
  new Promise((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        reject(new Error('Payload muito grande.'));
        req.destroy();
      }
    });

    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error('JSON invalido.'));
      }
    });

    req.on('error', reject);
  });

import { 
  buildContactEmailHtml, 
  buildClientConfirmationHtml, 
  buildChatbotLeadHtml, 
  buildChatbotClientHtml 
} from './lib/emailTemplates.js';


const sendEmail = async (payload) => {
  const missingEnv = getMissingEnv();
  if (missingEnv.length > 0) {
    throw new Error(`Variaveis SMTP ausentes: ${missingEnv.join(', ')}`);
  }

  const transporter = getTransporter();
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;
  const fromName = process.env.SMTP_FROM_NAME || 'PH.static';

  return transporter.sendMail({
    from: `${fromName} <${fromEmail}>`,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
    replyTo: payload.replyTo
  });
};

const handleContact = async (req, res) => {
  const payload = await readBody(req);

  console.log('📩 Recebida solicitacao de contato:', payload.email);

  if (!payload.name || !payload.email || !payload.projectType || !payload.message) {
    return json(res, 400, { error: 'Campos obrigatorios ausentes no formulario de contato.' });
  }

  const contactRecipient = process.env.CONTACT_EMAIL_TO || process.env.SMTP_USER;
  if (!contactRecipient) {
    return json(res, 503, { error: 'CONTACT_EMAIL_TO ou SMTP_USER nao configurado.' });
  }

  const ownerMessage = await sendEmail({
    to: contactRecipient,
    subject: `Novo lead do site: ${payload.projectType} - ${payload.name}`,
    html: buildContactEmailHtml(payload),
    text: `Novo lead do site\nNome: ${payload.name}\nEmail: ${payload.email}\nInteresse: ${payload.projectType}\nInvestimento: ${payload.budget}\nMensagem: ${payload.message}`,
    replyTo: payload.email
  });
  console.log('✅ E-mail enviado para o dono');

  await sendEmail({
    to: payload.email,
    subject: 'Recebi sua mensagem - PH.static',
    html: buildClientConfirmationHtml(payload),
    text: `Recebi sua mensagem, ${payload.name}. Seu contato sobre ${payload.projectType} foi recebido com sucesso e responderei em breve.`
  });
  console.log('✅ E-mail de confirmacao enviado para o cliente');

  return json(res, 200, { success: true, messageId: ownerMessage.messageId });
};

const handleTransactionalEmail = async (req, res) => {
  const payload = await readBody(req);

  if (!payload.to || !payload.subject || (!payload.html && !payload.text)) {
    return json(res, 400, { error: 'Payload de e-mail invalido.' });
  }

  const result = await sendEmail(payload);
  return json(res, 200, { success: true, messageId: result.messageId });
};

const handleChatbotLead = async (req, res) => {
  const payload = await readBody(req);

  if (!payload.name || !payload.email || !payload.projectType || !payload.designStatus) {
    return json(res, 400, { error: 'Dados obrigatorios do briefing nao foram enviados.' });
  }

  const contactRecipient = process.env.CONTACT_EMAIL_TO || process.env.SMTP_USER;
  if (!contactRecipient) {
    return json(res, 503, { error: 'CONTACT_EMAIL_TO ou SMTP_USER nao configurado.' });
  }

  const ownerMessage = await sendEmail({
    to: contactRecipient,
    subject: `Novo briefing do chatbot: ${payload.projectType} - ${payload.name}`,
    html: buildChatbotLeadHtml(payload),
    text: `Novo briefing do chatbot\n\n${buildChatbotSummaryText(payload)}`,
    replyTo: payload.email
  });

  const customerMessage = await sendEmail({
    to: payload.email,
    subject: 'Seu briefing foi recebido - PH.static',
    html: buildChatbotClientHtml(payload),
    text: `Seu briefing foi recebido com sucesso.\n\n${buildChatbotSummaryText(payload)}`
  });

  return json(res, 200, {
    success: true,
    ownerMessageId: ownerMessage.messageId || null,
    customerMessageId: customerMessage.messageId || null
  });
};

const getContentType = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon'
  };

  return types[ext] || 'application/octet-stream';
};

const serveStatic = async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const cleanPath = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
  const targetPath = path.join(distDir, cleanPath);
  const safePath = path.normalize(targetPath);

  if (!safePath.startsWith(distDir)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  const filePath = existsSync(safePath) ? safePath : path.join(distDir, 'index.html');

  try {
    await fs.access(filePath);
    res.writeHead(200, { 'Content-Type': getContentType(filePath) });
    createReadStream(filePath).pipe(res);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
};

const server = createServer(async (req, res) => {
  try {
    if (!req.url || !req.method) {
      return json(res, 400, { error: 'Requisicao invalida.' });
    }

    if (req.method === 'OPTIONS') {
      return json(res, 204, {});
    }

    if (req.url === '/api/contact' && req.method === 'POST') {
      return await handleContact(req, res);
    }

    if (req.url === '/api/email' && req.method === 'POST') {
      return await handleTransactionalEmail(req, res);
    }

    if (req.url === '/api/chatbot-lead' && req.method === 'POST') {
      return await handleChatbotLead(req, res);
    }

    return await serveStatic(req, res);
  } catch (error) {
    console.error('❌ Server Error:', error);
    return json(res, 500, { 
      error: error instanceof Error ? error.message : 'Falha interna no servidor.',
      details: error instanceof Error ? error.stack : undefined
    });
  }
});

server.listen(port, () => {
  console.log(`SMTP server ativo em http://127.0.0.1:${port}`);
});
