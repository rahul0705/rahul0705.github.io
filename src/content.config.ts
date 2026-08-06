import { glob } from 'astro/loaders';
import { defineCollection } from 'astro:content';

import { createAstroSchema } from './config/astro-adapter';
import { contentModels, type ContentCollectionModel } from './config/content-model';

const createAstroCollection = <Model extends ContentCollectionModel>(model: Model) =>
  defineCollection({
    schema: (context) => createAstroSchema(model, context),
    loader: glob({
      base: `./${model.folder}`,
      pattern: '**/*.{md,mdx}',
    }),
  });

type AstroCollections = {
  [Model in (typeof contentModels)[number] as Model['name']]: ReturnType<typeof createAstroCollection<Model>>;
};

export const collections = Object.fromEntries(
  contentModels.map((model) => [model.name, createAstroCollection(model)]),
) as AstroCollections;
