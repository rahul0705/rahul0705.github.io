export const sitemapLocations = (xml: string) =>
  Array.from(xml.matchAll(/<loc>(.*?)<\/loc>/g), ([, location]) => location.replaceAll('&amp;', '&'));
