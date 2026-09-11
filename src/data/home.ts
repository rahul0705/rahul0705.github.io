import { experienceSkillCoverage } from './resume';

const toolkitSkills = experienceSkillCoverage.slice(0, 6).map((skill) => skill.name);

export const home = {
  about: {
    title: 'About',
    description: 'My engineering background.',
    intro:
      'I lead engineering teams and build cloud platforms for operational systems. My experience spans NOAA satellite-data infrastructure, radio-frequency monitoring, and self-service software at Amazon Web Services.',
    highlights: [
      'Lead more than 30 engineers across infrastructure, observability, shared services, and security for NOAA’s GEO Cloud Compute Subsystem.',
      'Built the AWS foundation with TypeScript and CDK, then led infrastructure delivery for GOES processing and real-time SOLAR-1 data distribution.',
      'Led an eight-person RFIMS software team through security authorization and deployment of embedded collection and AWS GovCloud systems.',
    ],
    focusAreas: ['Engineering leadership', 'Cloud architecture', 'Operational systems'],
  },
  toolkit: {
    title: 'Technical Toolkit',
    description: 'Tools and languages used across my engineering work.',
    items: toolkitSkills,
  },
};
