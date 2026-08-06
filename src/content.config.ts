import { glob } from 'astro/loaders';
import { defineCollection } from 'astro:content';

import { createAstroSchema } from './config/astro-adapter';
import { contentModels, type ContentCollectionModel } from './config/content-model';

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
