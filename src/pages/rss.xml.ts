import rss from '@astrojs/rss';

import { siteConfig } from '../config/site';
import { getPublishedAt, getPublishedPosts } from '../lib/blog';

export async function GET(context: { site?: URL }) {
  const posts = await getPublishedPosts();

  return rss({
    title: siteConfig.rss.title,
    description: siteConfig.rss.description,
    site: context.site ?? siteConfig.url,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: getPublishedAt(post),
      link: `/blog/${post.id}/`,
      categories: [post.data.section, ...post.data.tags],
    })),
    customData: '<language>en-us</language>',
  });
}
