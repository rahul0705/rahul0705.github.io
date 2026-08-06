import type { EntryCollection, Field } from '@sveltia/cms';

import type { ContentCollectionModel, ContentField } from './content-model';

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
      return common;
    case 'text':
      return { ...common, widget: 'text' };
    case 'boolean':
      return {
        ...common,
        widget: 'boolean',
        default: typeof field.cms.default === 'boolean' ? field.cms.default : (field.default as boolean | undefined),
      };
    case 'date':
      return { ...common, widget: 'datetime', type: 'date', default: field.cms.default };
    case 'string-list':
      return { ...common, widget: 'list', default: field.default as string[] | undefined };
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
  fields: Object.values(model.fields).map(createSveltiaField),
});
