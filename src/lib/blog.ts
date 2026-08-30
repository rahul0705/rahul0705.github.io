import { getCollection, type CollectionEntry } from 'astro:content';

export const getPublishedAt = (post: Pick<CollectionEntry<'blog'>, 'data'>): Date => post.data.publishedDate;

export async function getPublishedPosts() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);

  return posts.sort((a, b) => getPublishedAt(b).getTime() - getPublishedAt(a).getTime());
}
