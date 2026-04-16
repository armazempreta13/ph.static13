import { BudgetData, ChatbotBriefingSubmissionResult, ContactFormData, ContactSubmissionResult, EmailPayload } from '../types';

const getApiBaseUrl = () => {
  const configuredBase = import.meta.env.VITE_CONTACT_API_BASE?.trim();

  if (configuredBase) {
    return configuredBase.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  return '';
};

const parseApiError = async (response: Response) => {
  try {
    const data = await response.json();
    return data?.error || 'Falha ao processar a requisicao.';
  } catch {
    return 'Falha ao processar a requisicao.';
  }
};

export const submitContactForm = async (data: ContactFormData): Promise<ContactSubmissionResult> => {
  const response = await fetch(`${getApiBaseUrl()}/api/contact`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const result = await response.json().catch(() => ({}));

  return {
    leadId: result?.messageId || null,
    storedInDatabase: false,
    emailDispatched: true
  };
};

export const sendTransactionalEmail = async (payload: EmailPayload) => {
  const response = await fetch(`${getApiBaseUrl()}/api/email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return response.json();
};

export const submitChatbotBriefing = async (data: BudgetData): Promise<ChatbotBriefingSubmissionResult> => {
  const response = await fetch(`${getApiBaseUrl()}/api/chatbot-lead`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const result = await response.json().catch(() => ({}));

  return {
    ownerMessageId: result?.ownerMessageId || null,
    customerMessageId: result?.customerMessageId || null,
    emailDispatched: true
  };
};
