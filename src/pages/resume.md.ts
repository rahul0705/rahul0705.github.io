import type { APIRoute } from 'astro';

import { resumeMarkdown } from '../data/resume';

export const GET: APIRoute = () =>
  new Response(resumeMarkdown, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  });
