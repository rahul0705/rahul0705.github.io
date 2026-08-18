import type { ContentCollectionModel } from './types';

export const defineModel = <const Model extends ContentCollectionModel>(model: Model): Model => model;
