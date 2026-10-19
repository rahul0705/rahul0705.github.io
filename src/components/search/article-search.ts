import { sitePath } from '../../lib/site-url';

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

function resultLink(url: unknown, title: unknown): HTMLAnchorElement {
  if (typeof url !== 'string' || typeof title !== 'string') throw new Error('Invalid search link');
  const target = new URL(url, window.location.origin);
  if (target.origin !== window.location.origin || !target.pathname.startsWith(sitePath('/blog/'))) {
    throw new Error('Invalid article URL');
  }
  const link = document.createElement('a');
  link.href = target.href;
  link.textContent = title;
  link.className = 'link link-primary';
  return link;
}

function renderResult(data: unknown): HTMLLIElement {
  if (!isRecord(data) || !isRecord(data.meta) || typeof data.excerpt !== 'string') {
    throw new Error('Invalid search result');
  }
  const item = document.createElement('li');
  item.className = 'list-row block min-w-0 break-words px-0';
  const heading = document.createElement('h2');
  heading.className = 'mb-2 text-xl font-semibold';
  heading.append(resultLink(data.url, data.meta.title));
  const metadata = document.createElement('p');
  metadata.className = 'mb-2 text-sm text-base-content/70';
  metadata.textContent = [data.meta.section, data.meta.tags].filter((value) => typeof value === 'string').join(' · ');
  const excerpt = document.createElement('p');
  excerpt.textContent = new DOMParser().parseFromString(data.excerpt, 'text/html').body.textContent;
  item.append(heading, metadata, excerpt);
  if (Array.isArray(data.sub_results)) {
    const headings = document.createElement('ul');
    headings.className = 'mt-3 grid gap-2 pl-4';
    for (const subResult of data.sub_results) {
      if (!isRecord(subResult) || typeof subResult.url !== 'string' || !subResult.url.includes('#')) continue;
      const entry = document.createElement('li');
      entry.append(resultLink(subResult.url, subResult.title));
      headings.append(entry);
    }
    item.append(headings);
  }
  return item;
}

function initializeSearch(search: HTMLElement) {
  const form = search.querySelector('form');
  const input = search.querySelector('input');
  const section = search.querySelector('#article-section');
  const tag = search.querySelector('#article-tag');
  const status = search.querySelector('[data-search-status]');
  const results = search.querySelector('[data-search-results]');
  const error = search.querySelector('[data-search-error]');
  const modulePath = search.dataset.module;
  if (
    !(
      form instanceof HTMLFormElement &&
      input instanceof HTMLInputElement &&
      section instanceof HTMLSelectElement &&
      tag instanceof HTMLSelectElement &&
      status instanceof HTMLElement &&
      results instanceof HTMLOListElement &&
      error instanceof HTMLElement &&
      modulePath
    )
  )
    return;

  const dialog = search.closest('dialog');
  const trigger = document.querySelector('[data-search-open]');
  if (dialog instanceof HTMLDialogElement && trigger instanceof HTMLButtonElement) {
    trigger.hidden = false;
    dialog.addEventListener('close', () => trigger.focus());
    trigger.addEventListener('click', () => {
      dialog.showModal();
      input.focus();
    });
  }
  let request = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let api: Promise<unknown> | undefined;
  const loadAPI = () => {
    api ??= (async () => {
      const module: unknown = await import(/* @vite-ignore */ modulePath);
      if (!isRecord(module) || typeof module.options !== 'function' || typeof module.search !== 'function') {
        throw new Error('Invalid search module');
      }
      await module.options({ baseUrl: search.dataset.base });
      return module;
    })();
    return api;
  };
  const run = async () => {
    clearTimeout(timer);
    const current = ++request;
    const query = input.value.trim();
    const filters: Record<string, string> = {};
    if (section.value) filters.Section = section.value;
    if (tag.value) filters.Tags = tag.value;
    results.replaceChildren();
    error.hidden = true;
    if (!query && !section.value && !tag.value) {
      status.textContent = 'Start with a title, topic, or phrase.';
      return;
    }
    status.textContent = 'Searching...';
    try {
      const module = await loadAPI();
      if (!isRecord(module) || typeof module.search !== 'function') throw new Error('Invalid search API');
      const response: unknown = await module.search(query || null, { filters });
      if (!isRecord(response) || !Array.isArray(response.results)) throw new Error('Invalid search response');
      const items = await Promise.all(
        response.results.map(async (result: unknown) => {
          if (!isRecord(result) || typeof result.data !== 'function') throw new Error('Invalid search result');
          return renderResult(await result.data());
        }),
      );
      if (current !== request) return;
      results.replaceChildren(...items);
      const label = query ? ` for ${query}` : '';
      status.textContent = items.length
        ? `${items.length} result${items.length === 1 ? '' : 's'}${label}`
        : `No results${label}`;
    } catch {
      if (current !== request) return;
      status.textContent = 'Search is unavailable right now.';
      error.hidden = false;
    }
  };
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    void run();
  });
  input.addEventListener('input', () => {
    ++request;
    clearTimeout(timer);
    timer = setTimeout(() => {
      void run();
    }, 250);
  });
  for (const filter of [section, tag])
    filter.addEventListener('change', () => {
      void run();
    });
  form.addEventListener('reset', () => {
    input.value = section.value = tag.value = '';
    void run();
  });
  input.addEventListener('keydown', (event) => {
    // Search inputs otherwise consume Escape to clear their value.
    if (event.key === 'Escape' && dialog instanceof HTMLDialogElement) {
      event.preventDefault();
      dialog.close();
    }
    if (event.key === 'ArrowDown') {
      const first = results.querySelector('a');
      if (first) {
        event.preventDefault();
        first.focus();
      }
    }
  });
  search.querySelector('[data-search-retry]')?.addEventListener('click', () => window.location.reload());
}

const search = document.querySelector('[data-article-search]');
if (search instanceof HTMLElement) initializeSearch(search);
