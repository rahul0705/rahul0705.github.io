import { describe, expect, it } from 'vitest';

import { blogContentModel } from '../../config/content-models/blog';
import { experienceContentModel } from '../../config/content-models/experience';
import { financialScopeContentModel } from '../../config/content-models/financial-scopes';
import { contentModels } from '../../config/content-models/registry';
import { skillContentModel } from '../../config/content-models/skills';
import { sveltiaConfig } from './config';

describe('Sveltia CMS configuration', () => {
  it('registers every shared content model', () => {
    expect(sveltiaConfig.collections.map((collection) => collection.name)).toEqual(
      contentModels.map((model) => model.name),
    );
  });

  it('derives the Blog Posts collection from the shared model', () => {
    const blog = sveltiaConfig.collections.find((collection) => collection.name === blogContentModel.name)!;

    expect(blog).toMatchObject({
      name: blogContentModel.name,
      label: blogContentModel.label,
      label_singular: blogContentModel.labelSingular,
      folder: blogContentModel.folder,
      slug: blogContentModel.slug,
    });
    const frontmatterFieldNames = Object.keys(blogContentModel.fields);

    expect(blog.fields.map((field) => field.name)).toEqual([...frontmatterFieldNames, 'body']);
  });

  it('keeps CMS transport settings separate from the shared content fields', () => {
    const blog = sveltiaConfig.collections.find((collection) => collection.name === blogContentModel.name)!;

    expect(sveltiaConfig).toMatchObject({
      load_config_file: false,
      media_folder: 'public/assets/{{year}}',
      public_folder: '/assets/{{year}}',
      output: {
        omit_empty_optional_fields: true,
      },
    });
    expect(blog.fields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'section', widget: 'select', required: true }),
        expect.objectContaining({
          name: 'coverImage',
          widget: 'image',
          media_folder: '/src/assets/{{year}}',
          public_folder: '../../assets/{{year}}',
        }),
        expect.objectContaining({ name: 'description', widget: 'text' }),
        expect.objectContaining({ name: 'draft', default: true }),
        expect.objectContaining({ name: 'title', required: true }),
      ]),
    );
  });

  it('uses the site branding in the CMS', () => {
    expect(sveltiaConfig).toMatchObject({
      app_title: 'Rahul Mohandas Content Manager',
      logo: {
        src: '/favicon.svg',
      },
    });
  });

  it('uses descriptive commit messages for content and media changes', () => {
    expect(sveltiaConfig.backend.commit_messages).toEqual({
      create: 'content({{collection}}): create {{slug}}',
      update: 'content({{collection}}): update {{slug}}',
      delete: 'content({{collection}}): delete {{slug}}',
      uploadMedia: 'content(assets): upload {{path}}',
      deleteMedia: 'content(assets): delete {{path}}',
    });
  });

  it('exposes experience entries as individual JSON files', () => {
    const experience = sveltiaConfig.collections.find((collection) => collection.name === experienceContentModel.name)!;

    expect(experience).toMatchObject({
      name: 'experience',
      folder: 'src/content/experience',
      format: 'json',
      extension: 'json',
      slug: "{{startDate | date('YYYY-MM')}}-{{organization}}-{{project}}-{{title}}",
      summary: "{{startDate | date('YYYY-MM')}} — {{organization}} — {{project}} — {{title}}",
      sortable_fields: {
        fields: ['startDate'],
        default: { field: 'startDate', direction: 'descending' },
      },
    });
    expect(experience.fields.map((field) => field.name)).toEqual([
      'title',
      'organization',
      'organizationUrl',
      'project',
      'projectUrl',
      'additionalInformation',
      'financialScopeIds',
      'startDate',
      'endDate',
      'description',
      'highlights',
      'skills',
    ]);
    expect(experience.fields.find((field) => field.name === 'skills')).toMatchObject({
      widget: 'relation',
      collection: 'skills',
      value_field: '{{slug}}',
      display_fields: ['name'],
      search_fields: ['name', 'description'],
      multiple: true,
    });
    expect(experience.fields.find((field) => field.name === 'financialScopeIds')).toMatchObject({
      widget: 'relation',
      collection: 'financialScopes',
      value_field: '{{slug}}',
      display_fields: ['name'],
      search_fields: ['name'],
      multiple: true,
    });
    expect(experience.fields.find((field) => field.name === 'startDate')).toMatchObject({
      widget: 'datetime',
      type: 'date',
      format: 'YYYY-MM-DD',
      required: true,
    });
    expect(experience.fields.find((field) => field.name === 'endDate')).toMatchObject({
      widget: 'datetime',
      type: 'date',
      format: 'YYYY-MM-DD',
      required: false,
    });
  });

  it('exposes skills and financial scopes as stable-ID JSON collections', () => {
    const skills = sveltiaConfig.collections.find((collection) => collection.name === skillContentModel.name)!;
    const financialScopes = sveltiaConfig.collections.find(
      (collection) => collection.name === financialScopeContentModel.name,
    )!;

    for (const collection of [skills, financialScopes]) {
      expect(collection).toMatchObject({
        format: 'json',
        extension: 'json',
        identifier_field: 'name',
        slug: '{{fields._slug}}',
        sortable_fields: { fields: ['name'], default: { field: 'name', direction: 'ascending' } },
      });
    }
    expect(skills.folder).toBe('src/content/skills');
    expect(financialScopes.folder).toBe('src/content/financial-scopes');
  });
});
