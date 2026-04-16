import { ViewType } from '../types';

export const INDEXABLE_VIEWS: ViewType[] = [
  'home',
  'about',
  'services',
  'portfolio',
  'process',
  'contact',
  'blog',
  'faq',
  'terms',
  'privacy',
];

const VIEW_SET = new Set<ViewType>([
  ...INDEXABLE_VIEWS,
  '404',
  'login',
  'client-portal',
  'admin-dashboard',
  'briefing',
]);

const BLOG_LABS = new Set(['perf', 'ai', 'mobile']);

export const isViewType = (value: string | null): value is ViewType => {
  return !!value && VIEW_SET.has(value as ViewType);
};

export const isIndexableView = (value: string | null): value is ViewType => {
  return !!value && INDEXABLE_VIEWS.includes(value as ViewType);
};

export const isBlogLabId = (value: string | null): value is string => {
  return !!value && BLOG_LABS.has(value);
};

export const toAbsoluteUrl = (siteUrl: string, value?: string): string => {
  if (!value) {
    return new URL(siteUrl).toString();
  }

  try {
    return new URL(value).toString();
  } catch {
    const normalizedBase = siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`;
    return new URL(value, normalizedBase).toString();
  }
};

export const buildPageUrl = (siteUrl: string, view: ViewType): string => {
  const url = new URL(siteUrl);

  if (view === 'home') {
    return url.toString();
  }

  url.searchParams.set('page', view);
  return url.toString();
};

export const buildServiceUrl = (siteUrl: string, serviceId: string): string => {
  const url = new URL(siteUrl);
  url.searchParams.set('page', 'services');
  url.searchParams.set('service', serviceId);
  return url.toString();
};

export const buildBlogArticleUrl = (siteUrl: string, articleId: string): string => {
  const url = new URL(siteUrl);
  url.searchParams.set('page', 'blog');
  url.searchParams.set('article', articleId);
  return url.toString();
};

export const buildBlogLabUrl = (siteUrl: string, labId: string): string => {
  const url = new URL(siteUrl);
  url.searchParams.set('page', 'blog');
  url.searchParams.set('lab', labId);
  return url.toString();
};

export const getOgType = (type: 'website' | 'article' | 'profile' | 'service'): 'website' | 'article' | 'profile' => {
  if (type === 'article' || type === 'profile') {
    return type;
  }

  return 'website';
};
