import rss from '@astrojs/rss';

import { site } from '../data/site';
import { getPublishedAt, getPublishedPosts } from '../lib/blog';

export async function GET(context: { site?: URL }) {
  const posts = await getPublishedPosts();

  return rss({
    title: `${site.title} Articles`,
    description:
      'Writing about software engineering, distributed systems, cloud infrastructure, and developer tooling.',
    site: context.site ?? site.url,
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
