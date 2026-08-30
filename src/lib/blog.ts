import { getCollection, type CollectionEntry } from 'astro:content';

const datedPostId = /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})-/;

export const getPublishedAt = (post: Pick<CollectionEntry<'blog'>, 'id'>): Date | undefined => {
  const match = post.id.match(datedPostId);
  if (!match?.groups) return undefined;

  const { year, month, day } = match.groups;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));

  return date.getUTCFullYear() === Number(year) &&
    date.getUTCMonth() === Number(month) - 1 &&
    date.getUTCDate() === Number(day)
    ? date
    : undefined;
};

export async function getPublishedPosts() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);

  return posts.sort((a, b) => (getPublishedAt(b)?.getTime() ?? 0) - (getPublishedAt(a)?.getTime() ?? 0));
}
