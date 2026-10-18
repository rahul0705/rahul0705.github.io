import { configuredSite } from '../../scripts/astro-config';
import { sitePath as mountPath } from '../../src/lib/site-url';

export const sitePath = (path: string) => mountPath(path, configuredSite.pathname);
export const publicSiteURL = configuredSite.href.replace(/\/$/, '');
