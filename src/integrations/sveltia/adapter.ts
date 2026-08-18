import type { EntryCollection, Field } from '@sveltia/cms';

import type { ContentCollectionModel, ContentField } from '../../lib/content-model/types';

const isRequired = (field: ContentField) => field.required ?? false;

const copyStrings = (values: readonly string[] | undefined) => {
  if (!values) return undefined;
  return [...values];
};

const createSveltiaField = (name: string, field: ContentField): Field => {
  const common = {
    name,
    label: field.cms.label,
    required: isRequired(field),
    after_input: field.cms.help,
    media_folder: field.cms.media?.mediaFolder,
    public_folder: field.cms.media?.publicFolder,
  };

  switch (field.kind) {
    case 'string': {
      if (field.options) return { ...common, widget: 'select', options: [...field.options] };
      if (field.cms.multiline) return { ...common, widget: 'text' };
      return common;
    }
    case 'boolean': {
      let defaultValue = field.default;
      if (typeof field.cms.initialValue === 'boolean') defaultValue = field.cms.initialValue;

      return {
        ...common,
        widget: 'boolean',
        default: defaultValue,
      };
    }
    case 'number':
      return {
        ...common,
        widget: 'number',
        value_type: 'float',
        min: field.min,
      };
    case 'date':
      return { ...common, widget: 'datetime', type: 'date', format: 'YYYY-MM-DD', default: field.cms.initialValue };
    case 'list':
      if (field.items.kind === 'string' && field.items.options) {
        return {
          ...common,
          widget: 'select',
          multiple: true,
          options: [...field.items.options],
          default: field.default,
        };
      }
      if (field.items.kind === 'string') return { ...common, widget: 'list', default: field.default };
      if (field.items.kind === 'object') {
        return {
          ...common,
          widget: 'list',
          summary: field.cms.itemSummary,
          default: field.default,
          fields: Object.entries(field.items.fields).map(([nestedName, nestedField]) =>
            createSveltiaField(nestedName, nestedField),
          ),
        };
      }
      return { ...common, widget: 'list', default: field.default, field: createSveltiaField('item', field.items) };
    case 'reference':
      return {
        ...common,
        widget: 'relation',
        collection: field.collection,
        value_field: field.valueField ?? '{{slug}}',
        display_fields: [...field.displayFields],
        search_fields: copyStrings(field.searchFields),
        multiple: field.multiple ?? false,
        default: field.default as string[] | undefined,
      };
    case 'object':
      return {
        ...common,
        widget: 'object',
        fields: Object.entries(field.fields).map(([nestedName, nestedField]) =>
          createSveltiaField(nestedName, nestedField),
        ),
      };
    case 'asset':
      return { ...common, widget: field.assetType };
  }
};

export const createSveltiaCollection = (model: ContentCollectionModel): EntryCollection => {
  const fields = Object.entries(model.fields).map(([name, field]) => createSveltiaField(name, field));
  if (model.body) {
    fields.push({
      name: model.body.name,
      label: model.body.cms.label,
      widget: 'richtext',
      required: false,
      after_input: model.body.cms.help,
    });
  }

  const collection: EntryCollection = {
    name: model.name,
    label: model.label,
    label_singular: model.labelSingular,
    folder: model.folder,
    slug: model.slug,
    fields,
  };

  if (model.identifierField) collection.identifier_field = model.identifierField;
  if (model.format) {
    collection.format = model.format;
    collection.extension = model.extensions?.[0] ?? model.format;
  }
  if (model.summary) collection.summary = model.summary;
  if (model.sort) {
    collection.sortable_fields = { fields: [...model.sort.fields] };
    if (model.sort.default) collection.sortable_fields.default = model.sort.default;
  }

  return collection;
};
