import { featuredSkillIds, skillCatalog } from './resume/skills';

const toolkitSkills = featuredSkillIds.map((id) => skillCatalog[id].name);

export const home = {
  description:
    'I build software, lead engineering teams, and like figuring out why something is harder than it needs to be.',
  hero: {
    supportingText:
      'Taking things apart to understand them has always come naturally. Putting them back together took some practice.',
  },
  recentArticles: {
    title: 'Recent Articles',
    description: "Things I've built, debugged, or learned the hard way.",
  },
  contact: {
    eyebrow: 'Contact',
    title: 'What are you working on?',
    description:
      "Built something useful, read something interesting, or found a better way to solve a problem? I'd like to hear about it.",
  },
  about: {
    title: 'About',
    description: 'Curiosity has a habit of turning into a project.',
    intro:
      'I lead engineering teams and build cloud platforms for operational systems. I tend to follow a problem past the application, into how we build it, deploy it, and keep it running. Somewhere along the way, I usually find something I want to automate.',
    highlights: [
      "Lead more than 30 engineers across infrastructure, observability, shared services, and security for NOAA's GEO Cloud Compute Subsystem.",
      'Developed a self-service marketing platform at Amazon Web Services, leading UI and UX improvements and integrating budget approvals and customer-segment selection.',
      'Led an eight-person RFIMS software team through security authorization and deployment of embedded collection and AWS GovCloud systems.',
    ],
    focusAreas: ['Engineering leadership', 'Cloud architecture', 'Operational systems'],
  },
  toolkit: {
    title: 'Technical Toolkit',
    description: 'Technologies and practices behind my engineering work.',
    items: toolkitSkills,
  },
  dotfiles: {
    title: 'Dotfiles',
    description: 'My setup for macOS, Linux, and Windows. Because configuring it once ought to be enough.',
    setupHref: '/dotfiles/',
    repositoryHref: 'https://github.com/rahul0705/dotfiles',
  },
};
