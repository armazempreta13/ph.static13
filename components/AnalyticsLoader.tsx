import React, { useEffect } from 'react';
import { useCookieConsent } from '../hooks/useCookieConsent';

interface AnalyticsLoaderProps {
  measurementId: string;
}

export const AnalyticsLoader: React.FC<AnalyticsLoaderProps> = ({ measurementId }) => {
  const { consent } = useCookieConsent();

  useEffect(() => {
    if (!measurementId || measurementId === 'G-XXXXXXXXXX') {
      return;
    }

    if (document.getElementById('google-analytics')) {
      return;
    }

    if (consent === true) {
      const script = document.createElement('script');
      script.id = 'google-analytics';
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      script.async = true;
      document.head.appendChild(script);

      const inlineScript = document.createElement('script');
      inlineScript.id = 'google-analytics-init';
      inlineScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${measurementId}', { 'anonymize_ip': true });
      `;
      document.head.appendChild(inlineScript);

      return () => {};
    }
  }, [consent, measurementId]);

  return null;
};
