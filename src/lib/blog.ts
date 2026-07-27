import { getCollection } from 'astro:content';

export async function getPublishedPosts() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);

  return posts.sort((a, b) => (b.data.publishedAt?.getTime() ?? 0) - (a.data.publishedAt?.getTime() ?? 0));
}
