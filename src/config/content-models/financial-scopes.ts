import { defineModel } from '@rm-industries/content-model';

export const financialScopeContentModel = defineModel({
  name: 'financial-scopes',
  label: 'Financial Scopes',
  labelSingular: 'Financial Scope',
  folder: 'src/content/financial-scopes',
  extensions: ['json'],
  format: 'json',
  slug: '{{fields._slug}}',
  sort: { fields: ['name'], default: { field: 'name', direction: 'ascending' } },
  fields: {
    name: { kind: 'string', required: true, label: 'Name' },
    amount: {
      kind: 'number',
      required: true,
      min: 0.01,
      label: 'Fallback amount',
      help: 'Positive checked-in value used when the source cannot be refreshed.',
    },
    currency: {
      kind: 'string',
      required: true,
      options: [{ label: 'USD', value: 'USD' }],
      label: 'Currency',
    },
    category: {
      kind: 'string',
      required: true,
      options: [
        { label: 'Contract', value: 'contract' },
        { label: 'Program budget', value: 'program-budget' },
        { label: 'Investment', value: 'investment' },
        { label: 'Revenue', value: 'revenue' },
        { label: 'Other', value: 'other' },
      ],
      label: 'Category',
    },
    amountBasis: {
      kind: 'string',
      required: true,
      options: [
        { label: 'Ceiling', value: 'ceiling' },
        { label: 'Base and options', value: 'base-and-options' },
        { label: 'Annual', value: 'annual' },
        { label: 'Lifetime', value: 'lifetime' },
        { label: 'Estimated', value: 'estimated' },
      ],
      label: 'Amount basis',
    },
    source: {
      kind: 'object',
      label: 'USAspending source',
      help: 'Optional source used to refresh the checked-in fallback value.',
      fields: {
        provider: {
          kind: 'string',
          required: true,
          options: [{ label: 'USAspending', value: 'usaspending' }],
          label: 'Provider',
        },
        awardId: { kind: 'string', required: true, label: 'Award ID' },
        amountField: {
          kind: 'string',
          required: true,
          options: [{ label: 'Base and all options', value: 'base_and_all_options' }],
          label: 'Amount field',
        },
      },
    },
    sourceUrl: { kind: 'string', label: 'Source URL' },
    asOf: { kind: 'string', label: 'As-of date' },
  },
});
