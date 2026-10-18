import rss from '@astrojs/rss';

import { siteConfig } from '../config/site';
import { articles } from '../data/articles';
import { getPublishedAt, getPublishedPosts } from '../lib/blog';
import { siteURL } from '../lib/site-url';

export async function GET() {
  const posts = await getPublishedPosts();

  return rss({
    title: siteConfig.rss.title,
    description: articles.description,
    site: siteURL('/'),
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: getPublishedAt(post),
      link: siteURL(`/blog/${post.id}/`),
      categories: [post.data.section, ...post.data.tags],
    })),
    customData: '<language>en-us</language>',
  });
}
