import type { EntryCollection, Field } from '@sveltia/cms';

import type { ContentCollectionModel, ContentField } from '../../config/content-model';

const isRequired = (field: ContentField) => field.required ?? false;

const createSveltiaField = (field: ContentField): Field => {
  const common = {
    name: field.name,
    label: field.cms.label,
    required: isRequired(field),
    ...(field.cms.help ? { after_input: field.cms.help } : {}),
    ...(field.cms.media
      ? {
          media_folder: field.cms.media.mediaFolder,
          public_folder: field.cms.media.publicFolder,
        }
      : {}),
  };

  switch (field.kind) {
    case 'string':
      return field.cms.options ? { ...common, widget: 'select', options: [...field.cms.options] } : common;
    case 'text':
      return { ...common, widget: 'text' };
    case 'boolean':
      return {
        ...common,
        widget: 'boolean',
        default: typeof field.cms.default === 'boolean' ? field.cms.default : (field.default as boolean | undefined),
      };
    case 'number':
      return {
        ...common,
        widget: 'number',
        value_type: 'float',
        ...(field.min === undefined ? {} : { min: field.min }),
      };
    case 'date':
      return { ...common, widget: 'datetime', type: 'date', format: 'YYYY-MM-DD', default: field.cms.default };
    case 'string-list':
      return field.cms.options
        ? {
            ...common,
            widget: 'select',
            multiple: true,
            options: [...field.cms.options],
            default: field.default as string[] | undefined,
          }
        : { ...common, widget: 'list', default: field.default as string[] | undefined };
    case 'relation':
      if (!field.relation) throw new Error(`Missing relation configuration for ${field.name}`);
      return {
        ...common,
        widget: 'relation',
        collection: field.relation.collection,
        value_field: field.relation.valueField ?? '{{slug}}',
        display_fields: [...field.relation.displayFields],
        ...(field.relation.searchFields ? { search_fields: [...field.relation.searchFields] } : {}),
        multiple: field.relation.multiple ?? false,
        default: field.default as string[] | undefined,
      };
    case 'object':
      return {
        ...common,
        widget: 'object',
        fields: Object.values(field.fields ?? {}).map(createSveltiaField),
      };
    case 'link':
      return {
        ...common,
        widget: 'object',
        fields: [
          { name: 'label', label: 'Label' },
          { name: 'url', label: 'URL' },
        ],
      };
    case 'link-list':
      return {
        ...common,
        widget: 'list',
        summary: '{{fields.label}}',
        default: field.default,
        fields: [
          { name: 'label', label: 'Label' },
          { name: 'url', label: 'URL' },
        ],
      };
    case 'image':
      return { ...common, widget: 'image' };
    case 'file':
      return { ...common, widget: 'file' };
    case 'body':
      return { ...common, widget: 'richtext' };
  }
};

export const createSveltiaCollection = (model: ContentCollectionModel): EntryCollection => ({
  name: model.name,
  label: model.label,
  label_singular: model.labelSingular,
  folder: model.folder,
  slug: model.slug,
  ...(model.identifierField ? { identifier_field: model.identifierField } : {}),
  ...(model.format ? { format: model.format, extension: model.extensions?.[0] ?? model.format } : {}),
  ...(model.summary ? { summary: model.summary } : {}),
  ...(model.sort
    ? {
        sortable_fields: {
          fields: [...model.sort.fields],
          ...(model.sort.default ? { default: model.sort.default } : {}),
        },
      }
    : {}),
  fields: Object.values(model.fields).map(createSveltiaField),
});
