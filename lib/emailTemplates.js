/**
 * Email Templates System - PH.static
 * Versão premium clean:
 * - fundo 100% branco
 * - card leve e elegante
 * - roxo só como destaque
 * - pronto para Gmail / clientes de e-mail
 */

const LOGO_URL = 'https://i.imgur.com/zaciqTU.png';

const C = {
  bg: '#ffffff',
  card: '#ffffff',
  surface: '#f8fafc',
  border: '#e5e7eb',
  borderSoft: '#eef2f7',

  purple: '#7c3aed',
  purpleSoft: '#f5f3ff',
  purpleText: '#6d28d9',
  gradientStart: '#8b5cf6',
  gradientEnd: '#7c3aed',

  text: '#111827',
  textSoft: '#374151',
  muted: '#6b7280',
  light: '#9ca3af',

  success: '#10b981',
  white: '#ffffff',
};

/**
 * Escapes HTML characters to prevent XSS.
 */
export const escapeHtml = (unsafe) => {
  if (!unsafe) return '';
  return String(unsafe)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
};

/* ───────────────────────── Helpers ───────────────────────── */

const badge = (text) => `
  <span style="
    display:inline-block;
    background:${C.purpleSoft};
    color:${C.purpleText};
    font-size:11px;
    font-weight:700;
    text-transform:uppercase;
    letter-spacing:.08em;
    padding:6px 12px;
    border-radius:999px;
  ">
    ${text}
  </span>
`;

const sectionTitle = (text) => `
  <p style="
    margin:0 0 12px;
    font-size:12px;
    line-height:1.4;
    color:${C.light};
    font-weight:700;
    text-transform:uppercase;
    letter-spacing:.08em;
  ">
    ${text}
  </p>
`;

const dataRow = (label, value, isLast = false) => `
  <tr>
    <td style="
      padding:14px 0;
      border-bottom:${isLast ? 'none' : `1px solid ${C.borderSoft}`};
      font-size:14px;
    ">
      <span style="
        display:block;
        margin-bottom:4px;
        color:${C.light};
        font-size:12px;
        font-weight:600;
        text-transform:uppercase;
        letter-spacing:.04em;
      ">
        ${label}
      </span>
      <span style="
        color:${C.text};
        font-weight:600;
        line-height:1.6;
      ">
        ${value}
      </span>
    </td>
  </tr>
`;

const infoBox = (html) => `
  <div style="
    background:${C.surface};
    border:1px solid ${C.border};
    border-radius:16px;
    padding:22px;
  ">
    ${html}
  </div>
`;

const quoteBox = (text) => `
  <div style="
    border:1px solid ${C.border};
    background:${C.surface};
    border-radius:16px;
    padding:20px;
    color:${C.textSoft};
    font-size:14px;
    line-height:1.75;
    white-space:pre-wrap;
  ">
    ${text}
  </div>
`;

const button = (label, href) => `
  <a
    href="${href}"
    style="
      display:inline-block;
      padding:14px 24px;
      border-radius:12px;
      text-decoration:none;
      font-size:14px;
      font-weight:700;
      color:${C.white};
      background:${C.gradientEnd};
      background-image:linear-gradient(135deg, ${C.gradientStart}, ${C.gradientEnd});
    "
  >
    ${label}
  </a>
`;

const divider = () => `
  <div style="height:1px; background:${C.borderSoft}; margin:28px 0;"></div>
`;

const iconCircleCheck = () => `
  <div style="text-align:center; margin-bottom:18px;">
    <div style="
      width:48px;
      height:48px;
      background:${C.purple};
      border-radius:100px;
      display:inline-block;
      text-align:center;
    ">
      <!-- Usando caractere Unicode para máxima compatibilidade sem quebrar imagem -->
      <span style="color:white; font-size:24px; line-height:48px; font-weight:bold;">✓</span>
    </div>
  </div>
`;

const buildBaseEmail = (content, previewText = 'Novo contato recebido') => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>PH.static</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

    body {
      margin: 0;
      padding: 0;
      background: ${C.bg};
      font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      -webkit-font-smoothing: antialiased;
    }

    table {
      border-collapse: collapse;
    }

    a {
      color: inherit;
    }
  </style>
</head>
<body style="margin:0;padding:0;background:${C.bg};">
  <div style="
    display:none;
    font-size:1px;
    color:${C.bg};
    line-height:1px;
    max-height:0;
    max-width:0;
    opacity:0;
    overflow:hidden;
  ">
    ${previewText}
  </div>

  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background:${C.bg};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:620px;">
          
          <!-- Card -->
          <tr>
            <td style="
              background:${C.card};
              border:1px solid ${C.border};
              border-radius:24px;
              padding:36px 30px;
            ">
              <!-- Logo Interna -->
              <div style="text-align:center; padding-bottom:32px;">
                <img
                  src="${LOGO_URL}"
                  height="32"
                  alt="PH.static"
                  style="display:inline-block; border:0; outline:none;"
                />
              </div>
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:20px 10px 0;">
              <p style="
                margin:0;
                font-size:12px;
                line-height:1.7;
                color:${C.muted};
              ">
                PH.static — Especialista em Performance Digital
              </p>
              <p style="
                margin:8px 0 0;
                font-size:11px;
                line-height:1.7;
                color:${C.light};
              ">
                © ${new Date().getFullYear()} PH.static · phstatic.com.br
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/* ─────────────────── 1) Lead do formulário (dono) ─────────────────── */

export const buildContactEmailHtml = (payload) => buildBaseEmail(`
  <div style="text-align:center; margin-bottom:28px;">
    ${badge('Novo Lead')}
    <h1 style="
      margin:18px 0 10px;
      font-size:28px;
      line-height:1.15;
      color:${C.text};
      font-weight:800;
      letter-spacing:-0.03em;
    ">
      Novo contato via site
    </h1>
    <p style="
      margin:0;
      font-size:15px;
      line-height:1.7;
      color:${C.muted};
    ">
      Você recebeu uma nova solicitação de contato.
    </p>
  </div>

  ${sectionTitle('Informações do cliente')}
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="
    margin-bottom:28px;
  ">
    ${dataRow('Nome', escapeHtml(payload.name))}
    ${dataRow(
      'E-mail',
      `<a href="mailto:${escapeHtml(payload.email)}" style="color:${C.purple}; text-decoration:none;">${escapeHtml(payload.email)}</a>`
    )}
    ${dataRow('Tipo de projeto', escapeHtml(payload.projectType))}
    ${dataRow('Investimento estimado', escapeHtml(payload.budget || 'Não informado'), true)}
  </table>

  ${sectionTitle('Mensagem')}
  ${quoteBox(escapeHtml(payload.message))}

  <div style="margin-top:32px; text-align:center;">
    ${button('Responder agora', `mailto:${escapeHtml(payload.email)}`)}
  </div>
`, `Novo lead: ${payload.name} interessado em ${payload.projectType}`);

/* ─────────────────── 2) Confirmação para cliente ─────────────────── */

export const buildClientConfirmationHtml = (payload) => buildBaseEmail(`
  <div style="text-align:center; margin-bottom:28px;">
    ${iconCircleCheck()}
    <h1 style="
      margin:0 0 10px;
      font-size:28px;
      line-height:1.15;
      color:${C.text};
      font-weight:800;
      letter-spacing:-0.03em;
    ">
      Mensagem recebida!
    </h1>
    <p style="
      margin:0;
      font-size:16px;
      line-height:1.7;
      color:${C.muted};
    ">
      Olá, <strong style="color:${C.text};">${escapeHtml(payload.name)}</strong>. Já recebi seu contato sobre
      <strong style="color:${C.text};">${escapeHtml(payload.projectType)}</strong>.
    </p>
  </div>

  ${infoBox(`
    <p style="
      margin:0;
      color:${C.textSoft};
      font-size:15px;
      line-height:1.8;
    ">
      Estou revisando os detalhes que você compartilhou para entender a melhor abordagem técnica e estratégica para o seu projeto. Meu foco é garantir que sua entrega não seja apenas visualmente impecável, mas validada para alta performance e conversão.
    </p>

    <div style="margin-top:18px; display:flex; align-items:center;">
      <div style="
        width:8px;
        height:8px;
        background:${C.success};
        border-radius:999px;
        margin-right:10px;
      "></div>
      <span style="
        color:${C.muted};
        font-size:13px;
        font-weight:700;
      ">
        Análise em andamento: retorno em até 24h úteis
      </span>
    </div>
  `)}

  ${divider()}

  ${sectionTitle('Resumo da sua mensagem')}
  <div style="
    border-left:3px solid ${C.purple};
    padding-left:16px;
    color:${C.textSoft};
    font-size:14px;
    line-height:1.8;
    font-style:italic;
  ">
    "${escapeHtml(payload.message)}"
  </div>
`, `Olá ${payload.name}, sua mensagem foi recebida com sucesso!`);

/* ─────────────────── Helper do chatbot ─────────────────── */

export const buildChatbotSummaryText = (payload) => {
  const lines = [
    'RESUMO DO BRIEFING',
    '------------------------------',
    `Nome: ${payload.name}`,
    `Email: ${payload.email}`,
    `Tipo de projeto: ${payload.projectType}`,
    `Design: ${payload.designStatus}`,
  ];

  if (payload.targetAudience) lines.push(`Público e objetivo: ${payload.targetAudience}`);
  if (payload.budgetRange) lines.push(`Faixa de investimento: ${payload.budgetRange}`);
  if (payload.timeline) lines.push(`Prazo: ${payload.timeline}`);
  if (payload.hasDomain) lines.push(`Domínio/Hospedagem: ${payload.hasDomain}`);

  if (Array.isArray(payload.functionalities) && payload.functionalities.length > 0) {
    lines.push('', 'Funcionalidades Selecionadas:');
    payload.functionalities.forEach((f) => lines.push(`- ${f}`));
  }

  if (payload.details) lines.push('', 'Observações:', payload.details);

  return lines.join('\n').trim();
};

/* ─────────────────── 3) Lead do chatbot (dono) ─────────────────── */

export const buildChatbotLeadHtml = (payload) => {
  const functionalities = Array.isArray(payload.functionalities) && payload.functionalities.length > 0
    ? payload.functionalities.map((f) => `
        <span style="
          display:inline-block;
          background:${C.purpleSoft};
          color:${C.purpleText};
          font-size:12px;
          font-weight:700;
          padding:6px 10px;
          border-radius:999px;
          margin:0 6px 6px 0;
        ">
          ${escapeHtml(f)}
        </span>
      `).join('')
    : `
        <span style="
          display:inline-block;
          background:${C.surface};
          color:${C.muted};
          font-size:12px;
          font-weight:600;
          padding:6px 10px;
          border-radius:999px;
        ">
          Nenhuma selecionada
        </span>
      `;

  return buildBaseEmail(`
    <div style="text-align:center; margin-bottom:28px;">
      ${badge('Briefing Completo')}
      <h1 style="
        margin:18px 0 10px;
        font-size:28px;
        line-height:1.15;
        color:${C.text};
        font-weight:800;
        letter-spacing:-0.03em;
      ">
        Novo briefing recebido
      </h1>
      <p style="
        margin:0;
        font-size:15px;
        line-height:1.7;
        color:${C.muted};
      ">
        Um lead concluiu o fluxo do chatbot.
      </p>
    </div>

    ${sectionTitle('Dados principais')}
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom:28px;">
      ${dataRow('Nome', escapeHtml(payload.name))}
      ${dataRow(
        'E-mail',
        `<a href="mailto:${escapeHtml(payload.email)}" style="color:${C.purple}; text-decoration:none;">${escapeHtml(payload.email)}</a>`
      )}
      ${dataRow('Tipo de projeto', escapeHtml(payload.projectType))}
      ${dataRow('Status do design', escapeHtml(payload.designStatus))}
      ${payload.budgetRange ? dataRow('Orçamento', escapeHtml(payload.budgetRange)) : ''}
      ${payload.timeline ? dataRow('Prazo', escapeHtml(payload.timeline), !payload.budgetRange) : ''}
    </table>

    ${sectionTitle('Funcionalidades')}
    <div style="margin-bottom:28px;">
      ${functionalities}
    </div>

    ${payload.details ? `
      ${sectionTitle('Detalhes extras')}
      ${quoteBox(escapeHtml(payload.details))}
    ` : ''}

    <div style="margin-top:32px; text-align:center;">
      ${button('Expandir conversa', `mailto:${escapeHtml(payload.email)}`)}
    </div>
  `, `Briefing recebido: ${payload.name} - ${payload.projectType}`);
};

/* ─────────────────── 4) Confirmação do chatbot (cliente) ─────────────────── */

export const buildChatbotClientHtml = (payload) => buildBaseEmail(`
  <div style="text-align:center; margin-bottom:28px;">
    ${iconCircleCheck()}
    <h1 style="
      margin:0 0 10px;
      font-size:28px;
      line-height:1.15;
      color:${C.text};
      font-weight:800;
      letter-spacing:-0.03em;
    ">
      Briefing recebido!
    </h1>
    <p style="
      margin:0;
      font-size:16px;
      line-height:1.7;
      color:${C.muted};
    ">
      Obrigado, <strong style="color:${C.text};">${escapeHtml(payload.name)}</strong>.
      Recebi os detalhes do seu projeto com sucesso.
    </p>
  </div>

  ${infoBox(`
    <p style="
      margin:0 0 16px;
      color:${C.textSoft};
      font-size:15px;
      line-height:1.8;
    ">
      Seu briefing foi encaminhado para análise. Vou avaliar as informações enviadas
      e preparar o melhor direcionamento para o seu projeto.
    </p>

    <p style="
      margin:0;
      color:${C.muted};
      font-size:14px;
      line-height:1.7;
    ">
      <strong style="color:${C.text};">Próximo passo:</strong> entrarei em contato em breve
      pelo e-mail ou WhatsApp.
    </p>
  `)}

  ${divider()}

  ${sectionTitle('Resumo do briefing')}
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
  </table>
`, `Briefing enviado com sucesso! Aguarde nosso contato.`);

/* ─────────────────── 5) Notificação de Cupom (dono) ─────────────────── */

export const buildPromoNotificationHtml = (payload, remaining) => buildBaseEmail(`
  <div style="text-align:center; margin-bottom:28px;">
    ${badge('🔥 Oferta de Inauguração')}
    <h1 style="
      margin:18px 0 10px;
      font-size:28px;
      line-height:1.15;
      color:${C.text};
      font-weight:800;
      letter-spacing:-0.03em;
    ">
      Novo Cupom Resgatado!
    </h1>
    <p style="
      margin:0;
      font-size:15px;
      line-height:1.7;
      color:${C.muted};
    ">
      Um cliente travou uma das 5 vagas da promoção de R$ 200.
    </p>
  </div>

  ${infoBox(`
    <div style="text-align:center;">
      <span style="font-size:12px; font-weight:700; color:${C.light}; text-transform:uppercase;">Status das Vagas</span>
      <h2 style="margin:8px 0; color:${C.purpleText}; font-size:32px; font-weight:800;">${remaining} / 5</h2>
      <p style="margin:0; color:${C.muted}; font-size:14px;">vagas restantes em produção</p>
    </div>
  `)}

  ${divider()}

  ${sectionTitle('Dados do interessado')}
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom:28px;">
    ${dataRow('Nome', escapeHtml(payload.name))}
    ${dataRow('WhatsApp', `<a href="https://wa.me/${payload.whatsapp.replace(/\D/g, '')}" style="color:${C.purpleText}; text-decoration:none;">${escapeHtml(payload.whatsapp)}</a>`, true)}
  </table>

  <div style="margin-top:32px; text-align:center;">
    ${button('Falar no WhatsApp', `https://wa.me/${payload.whatsapp.replace(/\D/g, '')}`)}
  </div>
`, `🔥 Novo Cupom: ${payload.name} resgatou uma vaga!`);