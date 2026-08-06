import { z } from 'astro/zod';
import type { SchemaContext } from 'astro:content';

import type { ContentCollectionModel, ContentField } from './content-model';

const isRequired = (field: ContentField) => field.required ?? false;

type AstroFieldOutput<Field extends ContentField> = Field['kind'] extends 'string' | 'text'
  ? Field extends { required: true }
    ? string
    : string | undefined
  : Field['kind'] extends 'boolean'
    ? Field extends { default: boolean } | { required: true }
      ? boolean
      : boolean | undefined
    : Field['kind'] extends 'date'
      ? Field extends { required: true }
        ? Date
        : Date | undefined
      : Field['kind'] extends 'string-list'
        ? Field extends { default: string[] } | { required: true }
          ? string[]
          : string[] | undefined
        : Field['kind'] extends 'file'
          ? Field extends { required: true }
            ? string
            : string | undefined
          : unknown;

type AstroSchemaShape<Model extends ContentCollectionModel> = {
  [Key in keyof Model['fields'] as Model['fields'][Key]['kind'] extends 'body'
    ? never
    : Model['fields'][Key]['name']]: z.ZodType<AstroFieldOutput<Model['fields'][Key]>>;
};

const createAstroField = (field: ContentField, image: SchemaContext['image']): z.ZodType<unknown> => {
  switch (field.kind) {
    case 'string':
    case 'text':
      return isRequired(field) ? z.string() : z.string().optional();
    case 'boolean':
      return field.default === undefined
        ? isRequired(field)
          ? z.boolean()
          : z.boolean().optional()
        : z.boolean().default(field.default as boolean);
    case 'date':
      return isRequired(field) ? z.coerce.date() : z.coerce.date().optional();
    case 'string-list':
      return field.default === undefined
        ? isRequired(field)
          ? z.array(z.string())
          : z.array(z.string()).optional()
        : z.array(z.string()).default(field.default as string[]);
    case 'image':
      return isRequired(field) ? image() : image().optional();
    case 'file':
      return isRequired(field) ? z.string() : z.string().optional();
    case 'body':
      return z.never();
  }
};

export const createAstroSchema = <Model extends ContentCollectionModel>(model: Model, context: SchemaContext) => {
  const shape = Object.fromEntries(
    Object.values(model.fields)
      .filter((field) => field.kind !== 'body')
      .map((field) => [field.name, createAstroField(field, context.image)]),
  );

  return z.object(shape as AstroSchemaShape<Model>);
};
