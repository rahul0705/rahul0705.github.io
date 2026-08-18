type ContentFieldKind = 'string' | 'boolean' | 'number' | 'date' | 'list' | 'object' | 'reference' | 'asset';

interface CmsFieldConfig {
  label: string;
  help?: string;
  initialValue?: never;
  multiline?: never;
  itemSummary?: never;
  media?: never;
}

type CmsStringFieldConfig = Omit<CmsFieldConfig, 'multiline'> & {
  multiline?: boolean;
};

type CmsBooleanFieldConfig = Omit<CmsFieldConfig, 'initialValue'> & {
  initialValue?: boolean;
};

type CmsDateFieldConfig = Omit<CmsFieldConfig, 'initialValue'> & {
  initialValue?: string;
};

type CmsListFieldConfig = Omit<CmsFieldConfig, 'itemSummary'> & {
  itemSummary?: string;
};

type CmsAssetFieldConfig = Omit<CmsFieldConfig, 'media'> & {
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

interface StringContentField extends ContentFieldBase<'string', CmsStringFieldConfig> {
  options?: ReadonlyArray<{ label: string; value: string }>;
}

type BooleanContentField = ContentFieldBase<'boolean', CmsBooleanFieldConfig, boolean>;

interface NumberContentField extends ContentFieldBase<'number', CmsFieldConfig> {
  min?: number;
}

type DateContentField = ContentFieldBase<'date', CmsDateFieldConfig>;

interface ListContentField extends ContentFieldBase<'list', CmsListFieldConfig, unknown[]> {
  items: ContentField;
}

interface ObjectContentField extends ContentFieldBase<'object', CmsFieldConfig> {
  fields: Record<string, ContentField>;
}

interface ReferenceContentField extends ContentFieldBase<'reference', CmsFieldConfig, string | string[]> {
  collection: string;
  multiple?: boolean;
  valueField?: string;
  displayFields: readonly string[];
  searchFields?: readonly string[];
}

interface AssetContentField extends ContentFieldBase<'asset', CmsAssetFieldConfig> {
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
