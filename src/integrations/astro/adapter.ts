import type { ImageMetadata } from 'astro';
import { z } from 'astro/zod';
import type { SchemaContext } from 'astro:content';

import type { ContentCollectionModel, ContentField } from '../../lib/content-model/types';

const isRequired = (field: ContentField) => field.required ?? false;

const parseDate = (value: unknown) => {
  if (typeof value === 'string') return new Date(value);
  return value;
};

const parseOptionalDate = (value: unknown) => {
  if (value === null || value === '') return undefined;
  return parseDate(value);
};

const dateSchema = z.preprocess(parseDate, z.date());

type OptionalUnlessRequiredOrDefault<Field, Output> = Field extends { required: true } | { default: unknown }
  ? Output
  : Output | undefined;

type AstroObjectOutput<Fields extends Record<string, ContentField>> = {
  [Key in keyof Fields]: AstroFieldOutput<Fields[Key]>;
};

type AstroFieldValueByKind<Field extends ContentField> = {
  string: string;
  boolean: boolean;
  number: number;
  date: Date;
  list: AstroListValue<Field>;
  object: AstroObjectValue<Field>;
  reference: AstroReferenceValue<Field>;
  asset: AstroAssetValue<Field>;
};

type AstroListValue<Field extends ContentField> = Field extends {
  kind: 'list';
  items: infer Item extends ContentField;
}
  ? Array<Exclude<AstroFieldOutput<Item>, undefined>>
  : never;

type AstroObjectValue<Field extends ContentField> = Field extends {
  kind: 'object';
  fields: infer Fields extends Record<string, ContentField>;
}
  ? AstroObjectOutput<Fields>
  : never;

type AstroReferenceValue<Field extends ContentField> = Field extends { kind: 'reference'; multiple: true }
  ? string[]
  : string;

type AstroAssetValue<Field extends ContentField> = Field extends { kind: 'asset'; assetType: 'file' }
  ? string
  : ImageMetadata;

type AstroFieldValue<Field extends ContentField> = AstroFieldValueByKind<Field>[Field['kind']];

type AstroFieldOutput<Field extends ContentField> = OptionalUnlessRequiredOrDefault<Field, AstroFieldValue<Field>>;

type AstroSchemaShape<Model extends ContentCollectionModel> = {
  [Key in keyof Model['fields']]: z.ZodType<AstroFieldOutput<Model['fields'][Key]>>;
};

const createAstroField = (name: string, field: ContentField, image: SchemaContext['image']): z.ZodType<unknown> => {
  switch (field.kind) {
    case 'string': {
      if (!field.options) {
        const schema = z.string();
        if (isRequired(field)) return schema;
        return schema.optional();
      }

      const schema = z.string().refine((value) => field.options!.some((option) => option.value === value), {
        message: `Choose a configured value for ${name}.`,
      });
      if (isRequired(field)) return schema;
      return schema.optional();
    }
    case 'boolean': {
      const schema = z.boolean();
      if (field.default !== undefined) return schema.default(field.default);
      if (isRequired(field)) return schema;
      return schema.optional();
    }
    case 'number': {
      let schema = z.number();
      if (field.min !== undefined) schema = schema.min(field.min);
      if (isRequired(field)) return schema;
      return schema.optional();
    }
    case 'date': {
      if (isRequired(field)) return dateSchema;
      return z.preprocess(parseOptionalDate, dateSchema.optional());
    }
    case 'list': {
      const schema = z.array(createAstroField(`${name} item`, field.items, image));
      if (field.default !== undefined) return schema.default(field.default);
      if (isRequired(field)) return schema;
      return schema.optional();
    }
    case 'reference': {
      if (field.multiple) {
        const schema = z.array(z.string().min(1));
        if (field.default !== undefined) return schema.default(field.default as string[]);
        if (isRequired(field)) return schema;
        return schema.optional();
      }
      const schema = z.string().min(1);
      if (isRequired(field)) return schema;
      return schema.optional();
    }
    case 'object': {
      const schema = z.object(
        Object.fromEntries(
          Object.entries(field.fields).map(([nestedName, nestedField]) => [
            nestedName,
            createAstroField(nestedName, nestedField, image),
          ]),
        ),
      );
      if (isRequired(field)) return schema;
      return schema.optional();
    }
    case 'asset': {
      if (field.assetType === 'image') {
        const schema = image();
        if (isRequired(field)) return schema;
        return schema.optional();
      }

      const schema = z.string();
      if (isRequired(field)) return schema;
      return schema.optional();
    }
  }
};

export const createAstroSchema = <Model extends ContentCollectionModel>(model: Model, context: SchemaContext) => {
  const shape = Object.fromEntries(
    Object.entries(model.fields).map(([name, field]) => [name, createAstroField(name, field, context.image)]),
  );

  return z.object(shape as AstroSchemaShape<Model>);
};
