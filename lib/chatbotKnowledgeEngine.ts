import { BudgetData } from '../types'; 

import {
  CHATBOT_DECISION_HINTS,
  CHATBOT_GLOSSARY,
  CHATBOT_KNOWLEDGE,
  CHATBOT_OBJECTION_HANDLERS
} from './chatbotKnowledge';

const normalize = (value = '') =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const tokenize = (value: string) => normalize(value).split(' ').filter(Boolean);

const scoreKeywords = (query: string, keywords: readonly string[]) => {
  const normalizedQuery = normalize(query);
  const tokens = tokenize(query);

  return keywords.reduce((score, keyword) => {
    const normalizedKeyword = normalize(keyword);

    if (normalizedQuery.includes(normalizedKeyword)) {
      return score + 5;
    }

    const keywordTokens = normalizedKeyword.split(' ');
    const tokenHits = keywordTokens.filter((token) => tokens.includes(token)).length;

    return score + tokenHits;
  }, 0);
};

const detectIntentBoost = (query: string, category: string) => {
  const normalizedQuery = normalize(query);
  const categorySignals: Record<string, string[]> = {
    package_selection: ['landing page', 'site', 'pacote', 'qual escolher', 'tipo de projeto'],
    pricing: ['preco', 'valor', 'orcamento', 'investimento', 'caro', 'custar'],
    timeline: ['prazo', 'tempo', 'urgente', 'entrega', 'dias'],
    design_branding: ['design', 'layout', 'identidade', 'visual', 'marca'],
    content_conversion: ['copy', 'conteudo', 'texto', 'cta', 'conversao'],
    seo: ['seo', 'google', 'busca', 'ranquear', 'palavra chave'],
    hosting_domain: ['dominio', 'hospedagem', 'servidor', 'dns', 'email profissional'],
    technical_stack: ['react', 'next', 'wordpress', 'tecnologia', 'stack', 'codigo'],
    maintenance_support: ['suporte', 'manutencao', 'ajuste', 'atualizacao', 'bug'],
    project_process: ['processo', 'revisao', 'briefing', 'etapas', 'aprovacao']
  };

  const signals = categorySignals[category] || [];
  return signals.some((signal) => normalizedQuery.includes(signal)) ? 4 : 0;
};

const buildDecisionHint = (query: string, data: BudgetData) => {
  const normalizedQuery = normalize(query);

  const hints = CHATBOT_DECISION_HINTS
    .map((hint) => {
      let score = scoreKeywords(query, hint.keywords);

      if (hint.projectTypes.includes(data.projectType)) {
        score += 3;
      }

      if (hint.budgetRanges.includes(data.budgetRange || '')) {
        score += 2;
      }

      if (hint.timelines.includes(data.timeline || '')) {
        score += 2;
      }

      if (hint.requiredSignals.some((signal) => normalizedQuery.includes(normalize(signal)))) {
        score += 3;
      }

      return { hint, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return hints[0]?.hint || null;
};

const buildGlossaryAppendix = (query: string) => {
  const matches = CHATBOT_GLOSSARY
    .map((item) => ({ item, score: scoreKeywords(query, item.keywords) }))
    .filter((item) => item.score >= 4)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map(({ item }) => `${item.term}: ${item.definition}`);

  if (matches.length === 0) {
    return '';
  }

  return `\n\nTermos importantes:\n${matches.map((item) => `- ${item}`).join('\n')}`;
};

const buildObjectionHelp = (query: string) => {
  const match = CHATBOT_OBJECTION_HANDLERS
    .map((item) => ({ item, score: scoreKeywords(query, item.keywords) }))
    .filter((item) => item.score >= 4)
    .sort((a, b) => b.score - a.score)[0];

  if (!match) {
    return '';
  }

  return `\n\nLeitura comercial objetiva:\n${match.item.response}`;
};

export const resolveSupportKnowledge = (query: string, data: BudgetData) => {
  const matches = CHATBOT_KNOWLEDGE
    .map((entry) => ({
      entry,
      score: scoreKeywords(query, entry.keywords) + detectIntentBoost(query, entry.category)
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);

  const bestMatch = matches[0]?.entry;
  const secondaryMatch = matches[1]?.entry;
  const decisionHint = buildDecisionHint(query, data);

  if (!bestMatch) {
    return {
      answer:
        'Entendi a direcao da pergunta, mas para te responder com precisao comercial eu preciso de um pouco mais de contexto.\n\nSe quiser, volte ao briefing e me diga tipo de projeto, prazo e objetivo. Com isso eu consigo te orientar melhor sem te empurrar uma proposta generica.',
      options: [
        { label: 'Montar briefing', value: 'SwitchToSales', nextId: 'check_project_type' },
        { label: 'Perguntar de outro jeito', value: 'Mais', nextId: 'support_question' },
        { label: 'Falar no WhatsApp', value: 'finish', nextId: 'finalize' }
      ]
    };
  }

  let answer = `${bestMatch.answer}\n\n${bestMatch.salesCue}`;

  if (secondaryMatch && secondaryMatch.category !== bestMatch.category) {
    answer += `\n\nPonto complementar:\n${secondaryMatch.answer}`;
  }

  if (decisionHint) {
    answer += `\n\nRecomendacao objetiva para o seu contexto:\n${decisionHint.guidance}`;
  }

  answer += buildObjectionHelp(query);
  answer += buildGlossaryAppendix(query);

  const options =
    bestMatch.recommendedNextStep === 'briefing'
      ? [
          { label: 'Voltar ao briefing', value: 'SwitchToSales', nextId: 'check_project_type' },
          { label: 'Fazer outra pergunta', value: 'Mais', nextId: 'support_question' },
          { label: 'Ir para o WhatsApp', value: 'finish', nextId: 'finalize' }
        ]
      : bestMatch.recommendedNextStep === 'whatsapp'
        ? [
            { label: 'Ir para o WhatsApp', value: 'finish', nextId: 'finalize' },
            { label: 'Voltar ao briefing', value: 'SwitchToSales', nextId: 'check_project_type' },
            { label: 'Fazer outra pergunta', value: 'Mais', nextId: 'support_question' }
          ]
        : [
            { label: 'Fazer outra pergunta', value: 'Mais', nextId: 'support_question' },
            { label: 'Voltar ao briefing', value: 'SwitchToSales', nextId: 'check_project_type' },
            { label: 'Ir para o WhatsApp', value: 'finish', nextId: 'finalize' }
          ];

  return { answer, options };
};
