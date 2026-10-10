export const skillCategories = [
  { label: 'Languages and frameworks', value: 'languages-frameworks' },
  { label: 'Cloud and infrastructure', value: 'cloud-infrastructure' },
  { label: 'Data and messaging', value: 'data-messaging' },
  { label: 'Delivery and automation', value: 'delivery-automation' },
  { label: 'Testing and quality', value: 'testing-quality' },
  { label: 'Security and compliance', value: 'security-compliance' },
  { label: 'Engineering practices', value: 'engineering-practices' },
] as const;

export type SkillCategory = (typeof skillCategories)[number]['value'];
