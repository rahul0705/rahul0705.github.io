import type { APIRoute } from 'astro';

import { resumeText } from '../data/resume';

export const GET: APIRoute = () =>
  new Response(resumeText, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
