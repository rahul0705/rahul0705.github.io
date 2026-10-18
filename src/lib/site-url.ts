export const sitePath = (path: string, base = import.meta.env.BASE_URL): string => {
  if (!path.startsWith('/') || path.startsWith('//') || base === '/') return path;
  return `${base.replace(/\/$/, '')}${path}`;
};

export const siteURL = (
  path: string,
  target = { site: import.meta.env.SITE, base: import.meta.env.BASE_URL },
): string => {
  if (!target.site) throw new Error('Set site in astro.config.ts before generating absolute URLs.');
  return new URL(sitePath(path, target.base), target.site).href;
};
