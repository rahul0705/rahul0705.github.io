import { registerPreviewTemplate } from '@sveltia/cms';
import type { CustomPreviewTemplateProps } from '@sveltia/cms';

import { articleContentClasses } from '../../styles/article-classes';
import { siteTheme } from '../../themes/site-theme';
import { renderExperiencePreview } from './experience-preview';

const renderBlogPreview = ({ document, widgetFor }: CustomPreviewTemplateProps) => {
  document.documentElement.dataset.theme = siteTheme;
  document.body.classList.add(...articleContentClasses.split(' '));

  return widgetFor('body');
};

export const registerSveltiaPreviews = () => {
  registerPreviewTemplate('blog', renderBlogPreview);
  registerPreviewTemplate('experience', renderExperiencePreview);
};
