import { z } from 'astro/zod';
import type { SchemaContext } from 'astro:content';

import type { ContentCollectionModel, ContentField, ContentLink } from '../../config/content-model';

const isRequired = (field: ContentField) => field.required ?? false;

const dateSchema = z.preprocess((value) => (typeof value === 'string' ? new Date(value) : value), z.date());

type OptionalUnlessRequired<Field, Output> = Field extends { required: true } ? Output : Output | undefined;

type OptionalUnlessRequiredOrDefault<Field, Output, Default> = Field extends { required: true } | { default: Default }
  ? Output
  : Output | undefined;

type StringFieldOutput<Field> = OptionalUnlessRequired<Field, string>;
type BooleanFieldOutput<Field> = OptionalUnlessRequiredOrDefault<Field, boolean, boolean>;
type DateFieldOutput<Field> = OptionalUnlessRequired<Field, Date>;
type StringListFieldOutput<Field> = OptionalUnlessRequiredOrDefault<Field, string[], string[]>;
type LinkFieldOutput<Field> = OptionalUnlessRequired<Field, ContentLink>;
type LinkListFieldOutput<Field> = OptionalUnlessRequiredOrDefault<Field, ContentLink[], ContentLink[]>;
type FileFieldOutput<Field> = OptionalUnlessRequired<Field, string>;

type AstroFieldOutputByKind<Field extends ContentField> = {
  string: StringFieldOutput<Field>;
  text: StringFieldOutput<Field>;
  boolean: BooleanFieldOutput<Field>;
  date: DateFieldOutput<Field>;
  'string-list': StringListFieldOutput<Field>;
  link: LinkFieldOutput<Field>;
  'link-list': LinkListFieldOutput<Field>;
  image: unknown;
  file: FileFieldOutput<Field>;
  body: unknown;
};

type AstroFieldOutput<Field extends ContentField> = AstroFieldOutputByKind<Field>[Field['kind']];

type AstroSchemaShape<Model extends ContentCollectionModel> = {
  [
    Key in keyof Model['fields'] as Model['fields'][Key]['kind'] extends 'body' ? never : Model['fields'][Key]['name']
  ]: z.ZodType<AstroFieldOutput<Model['fields'][Key]>>;
};

const createAstroField = (field: ContentField, image: SchemaContext['image']): z.ZodType<unknown> => {
  const linkSchema = z.object({ label: z.string().min(1), url: z.string().min(1) });

  switch (field.kind) {
    case 'string': {
      const schema = field.cms.options
        ? z.string().refine((value) => field.cms.options!.some((option) => option.value === value), {
            message: `Choose a configured ${field.cms.label.toLowerCase()}.`,
          })
        : z.string();
      return isRequired(field) ? schema : schema.optional();
    }
    case 'text':
      return isRequired(field) ? z.string() : z.string().optional();
    case 'boolean':
      return field.default === undefined
        ? isRequired(field)
          ? z.boolean()
          : z.boolean().optional()
        : z.boolean().default(field.default as boolean);
    case 'date':
      return isRequired(field)
        ? dateSchema
        : z.preprocess((value) => (value === null || value === '' ? undefined : value), dateSchema.optional());
    case 'string-list':
      return field.default === undefined
        ? isRequired(field)
          ? z.array(z.string())
          : z.array(z.string()).optional()
        : z.array(z.string()).default(field.default as string[]);
    case 'link':
      return isRequired(field) ? linkSchema : linkSchema.optional();
    case 'link-list':
      return field.default === undefined
        ? isRequired(field)
          ? z.array(linkSchema)
          : z.array(linkSchema).optional()
        : z.array(linkSchema).default(field.default as ContentLink[]);
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
