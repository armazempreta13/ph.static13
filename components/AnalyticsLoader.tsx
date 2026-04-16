import React, { useEffect } from 'react';
import { useCookieConsent } from '../hooks/useCookieConsent';

interface AnalyticsLoaderProps {
  tagIds: string[];
}

const PLACEHOLDER_IDS = new Set(['', 'G-XXXXXXXXXX']);

export const AnalyticsLoader: React.FC<AnalyticsLoaderProps> = ({ tagIds }) => {
  const { consent } = useCookieConsent();
  const validTagIds = Array.from(
    new Set((tagIds || []).map((id) => id.trim()).filter((id) => !PLACEHOLDER_IDS.has(id)))
  );
  const validTagIdsKey = validTagIds.join('|');

  useEffect(() => {
    if (validTagIds.length === 0) {
      return;
    }

    if (document.getElementById('google-analytics')) {
      return;
    }

    if (consent === true) {
      const primaryTagId = validTagIds[0];

      const script = document.createElement('script');
      script.id = 'google-analytics';
      script.src = `https://www.googletagmanager.com/gtag/js?id=${primaryTagId}`;
      script.async = true;
      document.head.appendChild(script);

      const inlineScript = document.createElement('script');
      inlineScript.id = 'google-analytics-init';
      inlineScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        ${validTagIds.map((tagId) => `gtag('config', '${tagId}', { 'anonymize_ip': true });`).join('\n        ')}
      `;
      document.head.appendChild(inlineScript);

      return () => {};
    }
  }, [consent, validTagIdsKey]);

  return null;
};
