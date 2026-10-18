/** Resolve the same browser target for Playwright and its local preview server. */
export const resolvePreviewURL = (
  environment: { PLAYWRIGHT_PORT?: string; DEPLOYMENT_URL?: string } = process.env,
  base = '/',
): URL => {
  const deploymentURL = environment.DEPLOYMENT_URL;
  const url = new URL(deploymentURL ?? `http://127.0.0.1:${environment.PLAYWRIGHT_PORT ?? '4321'}${base}`);
  if (deploymentURL && url.protocol !== 'https:') {
    throw new Error('DEPLOYMENT_URL must use HTTPS.');
  }
  return url;
};
