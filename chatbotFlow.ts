import { BudgetData, ChatStep } from './types';
import { SERVICE_PACKAGES, CONTACT_CONFIG } from './config';

export const INITIAL_BUDGET: BudgetData = {
  name: '',
  email: '',
  projectType: '',
  designStatus: '',
  functionalities: [],
  details: '',
  budgetRange: '',
  calculatedEstimation: '',
  contactMethod: '',
  timeline: '',
  referenceLinks: '',
  targetAudience: '',
  hasDomain: '',
  hasHosting: '',
  designFormat: ''
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export const calculateEstimate = (data: BudgetData) => {
  let basePrice = 800;

  if (data.projectType) {
    const pkg = SERVICE_PACKAGES.find((p) => p.title === data.projectType);
    if (pkg) {
      const priceStr = pkg.price.replace(/[^0-9]/g, '');
      if (priceStr) basePrice = parseInt(priceStr, 10);
    }
  }

  if (data.functionalities && data.functionalities.length > 0) {
    basePrice += data.functionalities.length * 150;
  }

  if (data.designStatus === 'Nao tenho design') {
    basePrice += 500;
  } else if (data.designStatus === 'Tenho referencias') {
    basePrice += 200;
  }

  if (data.timeline?.toLowerCase().includes('urgente')) {
    basePrice *= 1.25;
  } else if (data.timeline?.toLowerCase().includes('flexivel')) {
    basePrice *= 0.9;
  }

  return {
    min: Math.round(basePrice * 0.85),
    max: Math.round(basePrice * 1.15)
  };
};

export const generateBriefingSummary = (data: BudgetData) => {
  const estimate = calculateEstimate(data);
  const estimateString = `${formatCurrency(estimate.min)} - ${formatCurrency(estimate.max)}`;

  let summary = `RESUMO DO BRIEFING\n`;
  summary += '------------------------------\n';
  summary += `Nome: ${data.name}\n`;
  if (data.email) summary += `Email: ${data.email}\n`;
  summary += `Tipo de projeto: ${data.projectType}\n`;
  summary += `Design: ${data.designStatus}\n`;
  if (data.targetAudience) summary += `Publico e objetivo: ${data.targetAudience}\n`;
  if (data.budgetRange) summary += `Faixa de investimento: ${data.budgetRange}\n`;
  if (data.timeline) summary += `Prazo: ${data.timeline}\n`;
  if (data.hasDomain) summary += `Dominio e hospedagem: ${data.hasDomain}\n`;

  if (data.functionalities && data.functionalities.length > 0) {
    summary += '\nFuncionalidades:\n';
    data.functionalities.forEach((func) => {
      summary += `- ${func}\n`;
    });
  }

  if (data.details) {
    summary += `\nObservacoes:\n${data.details}\n`;
  }

  summary += '\nEstimativa inicial:\n';
  summary += `${estimateString}\n`;

  return summary.trim();
};

export const buildChatbotLeadMessage = (data: BudgetData) => {
  let text = 'Lead originado no chatbot do site.\n\n';
  text += `${generateBriefingSummary(data)}\n\n`;
  text += 'Proximo passo esperado:\n';
  text += 'Responder com direcionamento comercial, ajuste de escopo ou proposta inicial.';
  return text;
};

export const generateWhatsAppLink = (data: BudgetData) => {
  const phone = CONTACT_CONFIG.WHATSAPP_NUMBER;

  let text = 'Ola! Vim pelo chatbot do site e quero avancar no projeto.\n\n';
  text += `${generateBriefingSummary(data)}\n\n`;
  text += 'Quero seguir para a proxima etapa e entender a proposta ideal.';

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
};

const validateName = (value: string) => {
  const cleaned = value.trim();

  if (cleaned.length < 2) {
    return { isValid: false, message: 'Me passe ao menos seu primeiro nome para eu continuar.' };
  }

  return { isValid: true, cleaned };
};

const validateEmail = (value: string) => {
  const cleaned = value.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(cleaned)) {
    return { isValid: false, message: 'Esse e-mail parece invalido. Envie no formato nome@dominio.com.' };
  }

  return { isValid: true, cleaned };
};

export const CHAT_FLOW: Record<string, ChatStep> = {
  start: {
    id: 'start',
    message: 'Ola. Eu vou te ajudar a sair daqui com um briefing comercial bem mais claro em poucos minutos.\n\nA ideia e simples: entender o tipo de projeto, o momento do negocio e o nivel de urgencia para te levar para a proposta certa.\n\nComo voce prefere ser chamado?',
    type: 'input',
    key: 'name',
    validation: validateName,
    inputPlaceholder: 'Seu nome...',
    nextId: 'check_project_type'
  },

  start_context: {
    id: 'start_context',
    message: (data) => `Vi que voce se interessou por ${data.projectType}. Boa escolha.\n\nAgora eu vou confirmar o contexto para te direcionar melhor e evitar uma proposta generica.\n\nComo voce prefere ser chamado?`,
    type: 'input',
    key: 'name',
    validation: validateName,
    inputPlaceholder: 'Seu nome...',
    nextId: 'check_project_type'
  },

  welcome_back: {
    id: 'welcome_back',
    message: (data) => `Voce ja tinha iniciado esse atendimento, ${data.name}.\n\nQuer continuar de onde parou ou prefere montar um novo briefing?`,
    type: 'options',
    options: [
      { label: 'Continuar briefing', value: 'continue', nextId: 'check_project_type' },
      { label: 'Comecar do zero', value: 'restart', nextId: 'start' }
    ]
  },

  check_project_type: {
    id: 'check_project_type',
    message: (data) => `${data.name}, qual dessas opcoes representa melhor o que voce quer colocar no ar agora?`,
    type: 'options',
    key: 'projectType',
    dynamicOptions: () => [
      ...SERVICE_PACKAGES.map((pkg) => ({ label: pkg.title, value: pkg.title, nextId: 'design_status' })),
      { label: 'Projeto personalizado', value: 'Personalizado', nextId: 'design_status' },
      { label: 'Ainda tenho duvidas', value: 'SwitchToSupport', nextId: 'support_start' }
    ]
  },

  design_status: {
    id: 'design_status',
    message: (data) => `Perfeito. Para ${data.projectType}, o proximo ponto e entender o nivel de material que ja existe.\n\nVoce ja tem layout, identidade visual ou referencias claras?`,
    type: 'options',
    key: 'designStatus',
    options: [
      { label: 'Preciso criar do zero', value: 'Nao tenho design', nextId: 'design_note' },
      { label: 'Ja tenho layout pronto', value: 'Sim, tenho design', nextId: 'functionalities' },
      { label: 'Tenho referencias', value: 'Tenho referencias', nextId: 'functionalities' }
    ]
  },

  design_note: {
    id: 'design_note',
    message: 'Sem problema. Eu considero a criacao visual na proposta para voce nao depender de uma estrutura improvisada.\n\nIsso costuma adicionar cerca de R$ 500 ao projeto, mas evita um site com cara generica.\n\nVamos seguir?',
    type: 'options',
    options: [
      { label: 'Sim, seguir', value: 'continue', nextId: 'functionalities' }
    ]
  },

  functionalities: {
    id: 'functionalities',
    message: 'Agora vamos para os recursos que fazem diferenca no uso e na conversao.\n\nMarque o que faria sentido para esse projeto:',
    type: 'multi-select',
    key: 'functionalities',
    options: [
      { label: 'Botao de WhatsApp', value: 'WhatsApp' },
      { label: 'Formulario de contato', value: 'Formulario' },
      { label: 'Galeria de fotos', value: 'Galeria' },
      { label: 'Animacoes e destaque visual', value: 'Animacoes' },
      { label: 'Blog ou area de conteudo', value: 'Blog' },
      { label: 'Multi-idioma', value: 'Multi-idioma' }
    ],
    nextId: 'define_audience'
  },

  define_audience: {
    id: 'define_audience',
    message: (data) => {
      const funcCount = data.functionalities?.length || 0;
      const intro = funcCount > 0
        ? 'Boa. Ja entendi parte da estrutura que voce quer construir.'
        : 'Certo. Vamos trabalhar com uma base mais objetiva e direta.';

      return `${intro}\n\nAgora me descreva em uma frase para quem esse site vai vender e qual resultado voce espera.\n\nExemplo: captar mais leads de clinica, apresentar servicos com mais autoridade, validar uma oferta nova.`;
    },
    type: 'input',
    key: 'targetAudience',
    inputPlaceholder: 'Publico e objetivo principal...',
    nextId: 'budget_range'
  },

  budget_range: {
    id: 'budget_range',
    message: (data) => `Entendido: ${data.targetAudience}.\n\nPara eu te conduzir para a solucao certa, qual faixa de investimento faz mais sentido hoje?`,
    type: 'options',
    key: 'budgetRange',
    options: [
      { label: 'Ate R$ 1.500', value: 'Ate R$ 1.500', nextId: 'timeline' },
      { label: 'R$ 1.500 a R$ 3.000', value: 'R$ 1.500 - R$ 3.000', nextId: 'timeline' },
      { label: 'R$ 3.000 a R$ 5.000', value: 'R$ 3.000 - R$ 5.000', nextId: 'timeline' },
      { label: 'Acima de R$ 5.000', value: 'Acima de R$ 5.000', nextId: 'timeline' },
      { label: 'Prefiro definir depois', value: 'A definir', nextId: 'timeline' }
    ]
  },

  timeline: {
    id: 'timeline',
    message: 'Qual o nivel de urgencia real desse projeto?',
    type: 'options',
    key: 'timeline',
    options: [
      { label: 'Urgente: preciso colocar no ar rapido', value: 'Urgente', nextId: 'urgency_note' },
      { label: 'Prazo normal: posso seguir com calma', value: 'Normal', nextId: 'hosting_domain' },
      { label: 'Flexivel: estou estruturando com mais tempo', value: 'Flexivel', nextId: 'hosting_domain' }
    ]
  },

  urgency_note: {
    id: 'urgency_note',
    message: 'Entendi. Projeto urgente entra com prioridade de agenda e costuma adicionar cerca de 25% no valor por causa da concentracao de entrega.\n\nQuer manter essa urgencia mesmo assim?',
    type: 'options',
    options: [
      { label: 'Sim, preciso acelerar', value: 'continue', nextId: 'hosting_domain' },
      { label: 'Nao, podemos seguir no prazo normal', value: 'change', nextId: 'timeline' }
    ]
  },

  hosting_domain: {
    id: 'hosting_domain',
    message: 'Voce ja tem dominio e hospedagem ou precisa que eu cuide dessa parte tambem?',
    type: 'options',
    key: 'hasDomain',
    options: [
      { label: 'Ja tenho dominio e hospedagem', value: 'Sim', nextId: 'details' },
      { label: 'Tenho so o dominio', value: 'So dominio', nextId: 'details' },
      { label: 'Preciso que voce resolva tudo', value: 'Nao', nextId: 'hosting_note' }
    ]
  },

  hosting_note: {
    id: 'hosting_note',
    message: 'Posso incluir registro, hospedagem inicial e configuracao completa.\n\nIsso costuma adicionar cerca de R$ 200 no primeiro ciclo, e evita perda de tempo com configuracao tecnica.\n\nSeguindo.',
    type: 'options',
    options: [
      { label: 'Entendi', value: 'continue', nextId: 'details' }
    ]
  },

  details: {
    id: 'details',
    message: 'Ultimo ponto de contexto.\n\nExiste alguma referencia, restricao ou detalhe comercial que eu preciso saber antes de montar o resumo?\n\nPode incluir concorrentes, paginas que voce gosta, tom da marca ou qualquer observacao importante.',
    type: 'input',
    key: 'details',
    inputPlaceholder: 'Detalhes adicionais...',
    nextId: 'ask_email',
    allowSkip: true
  },

  ask_email: {
    id: 'ask_email',
    message: 'Perfeito. Para eu te enviar uma copia do briefing e tambem entregar esse resumo ao PH, qual o seu melhor e-mail?',
    type: 'input',
    key: 'email',
    validation: validateEmail,
    inputPlaceholder: 'exemplo@email.com',
    nextId: 'show_summary'
  },

  show_summary: {
    id: 'show_summary',
    message: (data) => {
      let summary = `Fechado, ${data.name}.\n\n`;
      summary += 'RESUMO DO QUE FAZ MAIS SENTIDO HOJE\n';
      summary += '------------------------------\n';
      summary += `${generateBriefingSummary(data)}\n\n`;
      summary += 'Agora voce pode escolher o melhor canal: enviar por e-mail para registrar o briefing com copia para voce ou seguir direto para o WhatsApp.';
      return summary;
    },
    type: 'summary',
    options: [
      { label: 'Enviar briefing por e-mail', value: 'email_briefing', nextId: 'briefing_sent' },
      { label: 'Enviar briefing no WhatsApp', value: 'finish', nextId: 'finalize' },
      { label: 'Corrigir informacoes', value: 'review', nextId: 'review_menu' }
    ]
  },

  briefing_sent: {
    id: 'briefing_sent',
    message: (data) => `Pronto, ${data.name}. O briefing foi encaminhado para o PH e uma copia tambem foi enviada para ${data.email}.`,
    type: 'summary',
    options: [
      { label: 'Falar no WhatsApp com esse contexto', value: 'finish', nextId: 'finalize' },
      { label: 'Revisar briefing', value: 'review', nextId: 'review_menu' },
      { label: 'Encerrar', value: 'Encerrar' }
    ]
  },

  review_menu: {
    id: 'review_menu',
    message: 'Certo. O que voce quer ajustar?',
    type: 'options',
    options: [
      { label: 'E-mail', value: 'edit_email', nextId: 'ask_email' },
      { label: 'Tipo de projeto', value: 'edit_type', nextId: 'check_project_type' },
      { label: 'Design', value: 'edit_design', nextId: 'design_status' },
      { label: 'Funcionalidades', value: 'edit_funcs', nextId: 'functionalities' },
      { label: 'Publico e objetivo', value: 'edit_audience', nextId: 'define_audience' },
      { label: 'Prazo', value: 'edit_timeline', nextId: 'timeline' },
      { label: 'Detalhes', value: 'edit_details', nextId: 'details' },
      { label: 'Recomecar tudo', value: 'restart', nextId: 'start' }
    ]
  },

  support_start: {
    id: 'support_start',
    message: 'Posso esclarecer a parte comercial e tecnica antes de voce seguir.\n\nSobre o que voce quer resposta agora?',
    type: 'options',
    options: [
      { label: 'Fazer uma pergunta livre', value: 'PerguntaLivre', nextId: 'support_question' },
      { label: 'Qual pacote faz mais sentido?', value: 'Pacote', nextId: 'support_package' },
      { label: 'Formas de pagamento', value: 'Pagamento', nextId: 'support_payment' },
      { label: 'Tecnologias usadas', value: 'Tecnologia', nextId: 'support_tech' },
      { label: 'Prazos e entregas', value: 'Prazo', nextId: 'support_deadline' },
      { label: 'Suporte apos a entrega', value: 'Suporte', nextId: 'support_maintenance' },
      { label: 'Voltar ao briefing', value: 'SwitchToSales', nextId: 'check_project_type' }
    ]
  },

  support_question: {
    id: 'support_question',
    message: 'Escreva sua pergunta com suas palavras. Eu vou responder pela base de regras do projeto, sem inventar moda.',
    type: 'input',
    inputPlaceholder: 'Ex: vale mais uma landing page ou um site completo?',
    allowSkip: false
  },

  support_package: {
    id: 'support_package',
    message: 'Regra pratica:\n\nLanding Page Express: melhor quando a meta e vender uma oferta especifica com agilidade.\n\nSite Profissional: melhor quando voce precisa passar mais autoridade, explicar servicos com mais profundidade e construir presenca digital mais completa.\n\nSob medida: melhor quando existe regra propria, estrutura fora do padrao ou necessidade tecnica especifica.',
    type: 'options',
    options: [
      { label: 'Voltar ao briefing', value: 'SwitchToSales', nextId: 'check_project_type' },
      { label: 'Tenho outra duvida', value: 'Mais', nextId: 'support_start' }
    ]
  },

  support_payment: {
    id: 'support_payment',
    message: 'Pagamento e simples:\n\n50% para iniciar o projeto e reservar agenda.\n50% na entrega, depois da aprovacao.\n\nOpcoes: PIX, cartao e transferencia.\n\nA logica aqui e reduzir risco para os dois lados e manter o processo profissional.',
    type: 'options',
    options: [
      { label: 'Entendi', value: 'Voltar', nextId: 'support_end' },
      { label: 'Outra duvida', value: 'Mais', nextId: 'support_start' }
    ]
  },

  support_tech: {
    id: 'support_tech',
    message: 'Eu uso React, Next.js, Tailwind e deploy moderno porque isso costuma entregar tres vantagens reais:\n\n1. Mais velocidade para o visitante.\n2. Menos fragilidade tecnica do que sites montados com excesso de plugin.\n3. Base melhor para SEO, manutencao e evolucao.\n\nNao e tecnologia por vaidade. E tecnologia para o site trabalhar melhor.',
    type: 'options',
    options: [
      { label: 'Faz sentido', value: 'Voltar', nextId: 'support_end' },
      { label: 'Mais perguntas', value: 'Mais', nextId: 'support_start' }
    ]
  },

  support_deadline: {
    id: 'support_deadline',
    message: 'Prazo medio:\n\nLanding Page: 3 a 7 dias uteis.\nSite Profissional: 10 a 20 dias uteis.\nUrgente: prioridade de agenda e adicional de valor.\n\nO prazo comeca de verdade quando ja existe material minimo para executar sem retrabalho.',
    type: 'options',
    options: [
      { label: 'Entendi', value: 'Voltar', nextId: 'support_end' },
      { label: 'Tenho mais duvidas', value: 'Mais', nextId: 'support_start' }
    ]
  },

  support_maintenance: {
    id: 'support_maintenance',
    message: 'Depois da entrega existe suporte inicial para ajuste de bug e orientacao.\n\nSe voce quiser continuidade, posso estruturar manutencao para melhorias, conteudo e evolucao do projeto.\n\nNao fica amarrado. O objetivo e voce ter autonomia e previsibilidade.',
    type: 'options',
    options: [
      { label: 'Perfeito', value: 'Voltar', nextId: 'support_end' },
      { label: 'Tenho mais duvidas', value: 'Mais', nextId: 'support_start' }
    ]
  },

  support_end: {
    id: 'support_end',
    message: 'Quer voltar para montar o briefing ou prefere falar direto no WhatsApp agora?',
    type: 'options',
    options: [
      { label: 'Voltar ao briefing', value: 'SwitchToSales', nextId: 'check_project_type' },
      { label: 'Ir para o WhatsApp', value: 'finish', nextId: 'finalize' },
      { label: 'Tenho outra duvida', value: 'Mais', nextId: 'support_start' }
    ]
  },

  finalize: {
    id: 'finalize',
    message: (data) => `Fechado, ${data.name}.\n\nEstou abrindo o WhatsApp com o resumo do briefing.\n\nQuando voce enviar, o PH ja recebe contexto suficiente para te responder com bem mais precisao e velocidade.`,
    type: 'text'
  }
};
