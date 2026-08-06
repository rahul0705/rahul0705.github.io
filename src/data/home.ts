import { experienceSkillCoverage } from './resume';
import { site } from './site';

const toolkitSkills = experienceSkillCoverage.slice(0, 6).map((skill) => skill.name);

export const home = {
  about: {
    title: 'About',
    description: 'Software development across cloud platforms, embedded systems, and developer tooling.',
    intro: `I'm currently ${site.description}. My experience includes self-service marketing technology, cloud-based radio-frequency analysis, satellite-data processing, and operational tooling. I have led technical direction, delivery planning, and customer-facing software work across those systems.`,
    highlights: [
      'Building self-service marketing technology at Amazon Web Services.',
      'Leading cloud and embedded systems work for radio-frequency and satellite-data products.',
      'Experienced with architecture, delivery planning, security controls, and customer-facing software.',
    ],
    focusAreas: ['Cloud architecture', 'Developer tooling', 'Distributed systems'],
  },
  toolkit: {
    title: 'Technical Toolkit',
    description: 'Technologies used across cloud platforms, developer tooling, and data-processing systems.',
    items: toolkitSkills,
  },
};
