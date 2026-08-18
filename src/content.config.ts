import { glob } from 'astro/loaders';
import { defineCollection } from 'astro:content';

import { contentModels } from './config/content-models/registry';
import { createAstroSchema } from './integrations/astro/adapter';
import type { ContentCollectionModel } from './lib/content-model/types';

const createAstroCollection = <Model extends ContentCollectionModel>(model: Model) => {
  const extensions = model.extensions ?? ['md', 'mdx'];

  return defineCollection({
    schema: (context) => createAstroSchema(model, context),
    loader: glob({
      base: `./${model.folder}`,
      pattern: extensions.length === 1 ? `**/*.${extensions[0]}` : `**/*.{${extensions.join(',')}}`,
    }),
  });
};

type AstroCollections = {
  [Model in (typeof contentModels)[number] as Model['name']]: ReturnType<typeof createAstroCollection<Model>>;
};

export const collections = Object.fromEntries(
  contentModels.map((model) => [model.name, createAstroCollection(model)]),
) as AstroCollections;
