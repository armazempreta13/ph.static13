import React from 'react';
import { Helmet } from 'react-helmet-async';
import { FAQ } from '../types';
import { useContent } from '../contexts/ContentContext';
import { getOgType, toAbsoluteUrl } from '../lib/seo';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  imageAlt?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile' | 'service';
  schema?: Record<string, any> | Record<string, any>[];
  breadcrumbs?: { name: string; item: string }[];
  faq?: FAQ[];
  noindex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  image,
  imageAlt,
  url,
  type = 'website',
  schema,
  breadcrumbs,
  faq,
  noindex = false,
  publishedTime,
  modifiedTime
}) => {
  const { content } = useContent();
  const SITE_CONFIG = content.site;
  const CONTACT_CONFIG = content.contact;
  const ABOUT_CONFIG = content.about;
  const SERVICES = content.services || [];

  const siteOrigin = (SITE_CONFIG.URL || '').replace(/\/+$/, '');
  const fallbackPath =
    typeof window !== 'undefined'
      ? `${window.location.pathname}${window.location.search}${window.location.hash}`
      : '/';

  const pageUrl = toAbsoluteUrl(siteOrigin, url || fallbackPath);
  const ogImage = toAbsoluteUrl(
    siteOrigin,
    image || ABOUT_CONFIG?.IMAGE_URL || '/og-image.jpg'
  );

  const ogType = getOgType(type);

  const defaultTitle = 'Criação de Sites Profissionais, Landing Pages e SEO';
  const brandName = SITE_CONFIG.TITLE || 'PH Static';
  const brandSubtitle = SITE_CONFIG.SUBTITLE || 'Sites de Alta Performance';

  const fullTitle = title
    ? `${title} | ${brandName}`
    : `${defaultTitle} | ${brandName}`;

  const metaDescription =
    description ||
    SITE_CONFIG.DESCRIPTION ||
    'Criação de sites profissionais, landing pages de alta conversão e desenvolvimento web com foco em performance, SEO e resultado real para negócios. Solicite um orçamento.';

  const robotsContent = noindex
    ? 'noindex, nofollow, noarchive, nosnippet'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

  const defaultKeywords = [
    'criação de sites',
    'criação de sites profissionais',
    'site profissional',
    'desenvolvimento web',
    'desenvolvedor frontend',
    'landing page',
    'landing page de alta conversão',
    'site para empresa',
    'site moderno',
    'site responsivo',
    'seo',
    'seo técnico',
    'otimização de site',
    'react',
    'typescript',
    'next.js',
    'tailwind css',
    'web design',
    'site rápido',
    'site de alta performance',
    'orçamento de site',
    'desenvolvedor web brasil',
    'criação de sites brasília'
  ];

  const allKeywords = Array.from(
    new Set([...defaultKeywords, ...(keywords || [])].map((item) => item.trim()).filter(Boolean))
  );

  const safeSameAs = [
    CONTACT_CONFIG.INSTAGRAM_URL,
    CONTACT_CONFIG.GITHUB_URL
  ].filter(Boolean);

  const telephone = CONTACT_CONFIG.WHATSAPP_NUMBER
    ? `+${String(CONTACT_CONFIG.WHATSAPP_NUMBER).replace(/\D/g, '')}`
    : undefined;

  const siteLogo = toAbsoluteUrl(siteOrigin, '/favicon.svg');

  const breadcrumbSchema =
    breadcrumbs && breadcrumbs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: breadcrumbs.map((crumb, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: crumb.name,
            item: toAbsoluteUrl(siteOrigin, crumb.item)
          }))
        }
      : null;

  const servicesItemListSchema =
    SERVICES.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Serviços',
          itemListElement: SERVICES.map((service, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            item: {
              '@type': 'Service',
              name: service.title,
              description: service.purpose || service.description || service.title,
              provider: {
                '@id': `${siteOrigin}/#organization`
              }
            }
          }))
        }
      : null;

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${siteOrigin}/#organization`,
    name: brandName,
    alternateName: 'PH Development',
    url: siteOrigin,
    logo: siteLogo,
    image: ogImage,
    description: metaDescription,
    ...(CONTACT_CONFIG.EMAIL ? { email: CONTACT_CONFIG.EMAIL } : {}),
    ...(telephone ? { telephone } : {}),
    ...(CONTACT_CONFIG.PRICE_RANGE ? { priceRange: CONTACT_CONFIG.PRICE_RANGE } : {}),
    areaServed: {
      '@type': 'Country',
      name: 'Brasil'
    },
    ...(safeSameAs.length > 0 ? { sameAs: safeSameAs } : {}),
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'sales',
        ...(telephone ? { telephone } : {}),
        ...(CONTACT_CONFIG.EMAIL ? { email: CONTACT_CONFIG.EMAIL } : {}),
        availableLanguage: ['pt-BR']
      }
    ],
    address: {
      '@type': 'PostalAddress',
      ...(CONTACT_CONFIG.ADDRESS_LOCALITY
        ? { addressLocality: CONTACT_CONFIG.ADDRESS_LOCALITY }
        : {}),
      ...(CONTACT_CONFIG.ADDRESS_REGION
        ? { addressRegion: CONTACT_CONFIG.ADDRESS_REGION }
        : {}),
      ...(CONTACT_CONFIG.ADDRESS_COUNTRY
        ? { addressCountry: CONTACT_CONFIG.ADDRESS_COUNTRY }
        : { addressCountry: 'BR' })
    },
    ...(CONTACT_CONFIG.GEO_LAT && CONTACT_CONFIG.GEO_LONG
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: CONTACT_CONFIG.GEO_LAT,
            longitude: CONTACT_CONFIG.GEO_LONG
          }
        }
      : {}),
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '18:00'
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Serviços Digitais',
      itemListElement: SERVICES.map((service) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: service.title,
          description: service.purpose || service.description || service.title,
          provider: {
            '@id': `${siteOrigin}/#organization`
          }
        }
      }))
    }
  };

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${siteOrigin}/#localbusiness`,
    name: brandName,
    image: ogImage,
    url: siteOrigin,
    ...(telephone ? { telephone } : {}),
    ...(CONTACT_CONFIG.PRICE_RANGE ? { priceRange: CONTACT_CONFIG.PRICE_RANGE } : {}),
    address: {
      '@type': 'PostalAddress',
      ...(CONTACT_CONFIG.ADDRESS_LOCALITY
        ? { addressLocality: CONTACT_CONFIG.ADDRESS_LOCALITY }
        : {}),
      ...(CONTACT_CONFIG.ADDRESS_REGION
        ? { addressRegion: CONTACT_CONFIG.ADDRESS_REGION }
        : {}),
      ...(CONTACT_CONFIG.ADDRESS_COUNTRY
        ? { addressCountry: CONTACT_CONFIG.ADDRESS_COUNTRY }
        : { addressCountry: 'BR' })
    },
    areaServed: 'BR'
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteOrigin}/#website`,
    url: siteOrigin,
    name: brandName,
    description: brandSubtitle,
    inLanguage: 'pt-BR',
    publisher: {
      '@id': `${siteOrigin}/#organization`
    }
  };

  const webpageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${pageUrl}#webpage`,
    url: pageUrl,
    name: fullTitle,
    description: metaDescription,
    inLanguage: 'pt-BR',
    isPartOf: {
      '@id': `${siteOrigin}/#website`
    },
    about: {
      '@id': `${siteOrigin}/#organization`
    },
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: ogImage
    }
  };

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${siteOrigin}/#person`,
    name: 'Philippe Boechat',
    alternateName: 'PH',
    jobTitle: 'Desenvolvedor Frontend',
    url: siteOrigin,
    image: ogImage,
    worksFor: {
      '@id': `${siteOrigin}/#organization`
    },
    ...(safeSameAs.length > 0 ? { sameAs: safeSameAs } : {}),
    knowsAbout: [
      'React',
      'TypeScript',
      'SEO técnico',
      'Performance web',
      'Landing Pages',
      'Criação de sites',
      'Desenvolvimento frontend',
      'Conversão'
    ]
  };

  const mainServiceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${pageUrl}#service`,
    serviceType: title || 'Criação de Sites Profissionais',
    name: title || 'Criação de Sites Profissionais',
    description: metaDescription,
    provider: {
      '@id': `${siteOrigin}/#organization`
    },
    areaServed: {
      '@type': 'Country',
      name: 'Brasil'
    },
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: pageUrl
    }
  };

  const faqSchema =
    faq && faq.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faq.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.answer
            }
          }))
        }
      : null;

  const articleSchema =
    ogType === 'article'
      ? {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: fullTitle,
          description: metaDescription,
          image: [ogImage],
          author: {
            '@id': `${siteOrigin}/#person`
          },
          publisher: {
            '@id': `${siteOrigin}/#organization`
          },
          mainEntityOfPage: pageUrl,
          ...(publishedTime ? { datePublished: publishedTime } : {}),
          ...(modifiedTime ? { dateModified: modifiedTime } : {})
        }
      : null;

  const customSchemas = Array.isArray(schema) ? schema : schema ? [schema] : [];

  const schemasToRender = [
    organizationSchema,
    localBusinessSchema,
    websiteSchema,
    webpageSchema,
    personSchema,
    mainServiceSchema,
    servicesItemListSchema,
    breadcrumbSchema,
    faqSchema,
    articleSchema,
    ...customSchemas
  ].filter(Boolean);

  return (
    <Helmet prioritizeSeoTags>
      <html lang="pt-BR" />
      <title>{fullTitle}</title>

      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={allKeywords.join(', ')} />
      <meta name="author" content={brandName} />
      <meta name="robots" content={robotsContent} />
      <meta name="googlebot" content={robotsContent} />
      <meta name="language" content="pt-BR" />
      <meta name="referrer" content="strict-origin-when-cross-origin" />
      <meta name="theme-color" content="#7c3aed" />
      <meta name="format-detection" content="telephone=no, address=no, email=no" />

      {CONTACT_CONFIG.ADDRESS_COUNTRY && CONTACT_CONFIG.ADDRESS_REGION && (
        <meta
          name="geo.region"
          content={`${CONTACT_CONFIG.ADDRESS_COUNTRY}-${CONTACT_CONFIG.ADDRESS_REGION}`}
        />
      )}
      {CONTACT_CONFIG.ADDRESS_LOCALITY && (
        <meta name="geo.placename" content={CONTACT_CONFIG.ADDRESS_LOCALITY} />
      )}
      {CONTACT_CONFIG.GEO_LAT && CONTACT_CONFIG.GEO_LONG && (
        <>
          <meta
            name="geo.position"
            content={`${CONTACT_CONFIG.GEO_LAT};${CONTACT_CONFIG.GEO_LONG}`}
          />
          <meta
            name="ICBM"
            content={`${CONTACT_CONFIG.GEO_LAT}, ${CONTACT_CONFIG.GEO_LONG}`}
          />
        </>
      )}

      <link rel="canonical" href={pageUrl} />
      <link rel="alternate" hrefLang="pt-BR" href={pageUrl} />
      <link rel="alternate" hrefLang="x-default" href={pageUrl} />

      <meta property="og:locale" content="pt_BR" />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:secure_url" content={ogImage} />
      <meta property="og:image:alt" content={imageAlt || title || brandName} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={brandName} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={imageAlt || title || brandName} />

      {ogType === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {ogType === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}

      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': schemasToRender
        })}
      </script>
    </Helmet>
  );
};