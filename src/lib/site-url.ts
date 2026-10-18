export const sitePath = (path: string, base = import.meta.env.BASE_URL): string => {
  if (!path.startsWith('/') || path.startsWith('//') || base === '/') return path;
  return `${base.replace(/\/$/, '')}${path}`;
};

export const siteURL = (
  path: string,
  target = { site: import.meta.env.SITE!, base: import.meta.env.BASE_URL },
): string => new URL(sitePath(path, target.base), target.site).href;

// Convert an Astro request path back to a logical route before generating canonical URLs.
export const siteRoute = (pathname: string, base = import.meta.env.BASE_URL): string => {
  const prefix = base.replace(/\/$/, '');
  if (pathname === prefix) return '/';
  return pathname.startsWith(`${prefix}/`) ? pathname.slice(prefix.length) : pathname;
};
