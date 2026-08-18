export type ContentFieldKind = 'string' | 'boolean' | 'number' | 'date' | 'list' | 'object' | 'reference' | 'asset';

export interface CmsFieldConfig {
  label: string;
  help?: string;
  initialValue?: never;
  multiline?: never;
  itemSummary?: never;
  media?: never;
}

export type CmsStringFieldConfig = Omit<CmsFieldConfig, 'multiline'> & {
  multiline?: boolean;
};

export type CmsBooleanFieldConfig = Omit<CmsFieldConfig, 'initialValue'> & {
  initialValue?: boolean;
};

export type CmsDateFieldConfig = Omit<CmsFieldConfig, 'initialValue'> & {
  initialValue?: string;
};

export type CmsListFieldConfig = Omit<CmsFieldConfig, 'itemSummary'> & {
  itemSummary?: string;
};

export type CmsAssetFieldConfig = Omit<CmsFieldConfig, 'media'> & {
  media?: {
    mediaFolder: string;
    publicFolder: string;
  };
};

interface ContentFieldBase<
  Kind extends ContentFieldKind,
  CmsConfig extends Pick<CmsFieldConfig, 'label' | 'help'>,
  Default = never,
> {
  kind: Kind;
  required?: boolean;
  default?: Default;
  cms: CmsConfig;
}

export interface StringContentField extends ContentFieldBase<'string', CmsStringFieldConfig> {
  options?: ReadonlyArray<{ label: string; value: string }>;
}

export type BooleanContentField = ContentFieldBase<'boolean', CmsBooleanFieldConfig, boolean>;

export interface NumberContentField extends ContentFieldBase<'number', CmsFieldConfig> {
  min?: number;
}

export type DateContentField = ContentFieldBase<'date', CmsDateFieldConfig>;

export interface ListContentField extends ContentFieldBase<'list', CmsListFieldConfig, unknown[]> {
  items: ContentField;
}

export interface ObjectContentField extends ContentFieldBase<'object', CmsFieldConfig> {
  fields: Record<string, ContentField>;
}

export interface ReferenceContentField extends ContentFieldBase<'reference', CmsFieldConfig, string | string[]> {
  collection: string;
  multiple?: boolean;
  valueField?: string;
  displayFields: readonly string[];
  searchFields?: readonly string[];
}

export interface AssetContentField extends ContentFieldBase<'asset', CmsAssetFieldConfig> {
  assetType: 'image' | 'file';
}

export type ContentField =
  | StringContentField
  | BooleanContentField
  | NumberContentField
  | DateContentField
  | ListContentField
  | ObjectContentField
  | ReferenceContentField
  | AssetContentField;

export interface ContentCollectionModel {
  name: string;
  label: string;
  labelSingular: string;
  folder: string;
  extensions?: readonly string[];
  format?: 'json';
  identifierField?: string;
  slug: string;
  summary?: string;
  sort?: {
    fields: readonly string[];
    default?: {
      field: string;
      direction: 'ascending' | 'descending';
    };
  };
  fields: Record<string, ContentField>;
  body?: {
    name: string;
    cms: CmsFieldConfig;
  };
}
