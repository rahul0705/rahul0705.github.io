import { registerPreviewTemplate } from '@sveltia/cms';
import type { CustomPreviewTemplateProps } from '@sveltia/cms';

import { articleContentClasses } from '../../styles/article-classes';
import { renderExperiencePreview } from './experience-preview';

const renderBlogPreview = ({ document, widgetFor }: CustomPreviewTemplateProps) => {
  document.documentElement.dataset.theme = 'mocha';
  document.body.classList.add(...articleContentClasses.split(' '));

  return widgetFor('body');
};

export const registerSveltiaPreviews = () => {
  registerPreviewTemplate('blog', renderBlogPreview);
  registerPreviewTemplate('experience', renderExperiencePreview);
};
