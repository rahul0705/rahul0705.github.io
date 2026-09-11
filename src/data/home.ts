import { experienceSkillCoverage } from './resume';

const toolkitSkills = experienceSkillCoverage.slice(0, 6).map((skill) => skill.name);

export const home = {
  hero: {
    supportingText:
      "Curious by default. I build software, ask too many questions, and dig into how things work - especially when they don't.",
  },
  writing: {
    title: 'Recent Articles',
    description: 'Things I have built, debugged, or learned the hard way.',
  },
  contact: {
    eyebrow: 'Contact',
    title: 'What are you working on?',
    description:
      "Built something useful, read something interesting, or found a better way to solve a problem? I'd like to hear about it.",
  },
  about: {
    title: 'About',
    description: 'Somewhere between the architecture diagram and the debug logs.',
    intro:
      "I lead engineering teams and build cloud platforms for operational systems. I like understanding why things work, not just getting them to pass a test. Give me a stubborn bug or a repetitive task and I'll probably come back with an explanation, a script, or both.",
    highlights: [
      "Lead more than 30 engineers across infrastructure, observability, shared services, and security for NOAA's GEO Cloud Compute Subsystem.",
      'Developed a self-service marketing platform at Amazon Web Services, leading UI and UX improvements and integrating budget approvals and customer-segment selection.',
      'Led an eight-person RFIMS software team through security authorization and deployment of embedded collection and AWS GovCloud systems.',
    ],
    focusAreas: ['Engineering leadership', 'Cloud architecture', 'Operational systems'],
  },
  toolkit: {
    title: 'Technical Toolkit',
    description: 'Tools I use to build things and keep them running.',
    items: toolkitSkills,
  },
};
