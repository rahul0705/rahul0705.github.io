import { experienceSkillCoverage } from './resume';

const toolkitSkills = experienceSkillCoverage.slice(0, 6).map((skill) => skill.name);

export const home = {
  about: {
    title: 'About',
    description: 'My engineering background.',
    intro:
      'I develop software for cloud platforms, embedded systems, and operational tools. My work spans system architecture, technical direction, delivery planning, and collaboration with customers.',
    highlights: [
      'Self-service marketing technology at Amazon Web Services.',
      'Cloud-based radio-frequency analysis and satellite-data processing.',
      'Security controls and tooling for operational systems.',
    ],
    focusAreas: ['Cloud architecture', 'Developer tooling', 'Distributed systems'],
  },
  toolkit: {
    title: 'Technical Toolkit',
    description: 'Tools and languages used across my engineering work.',
    items: toolkitSkills,
  },
};
