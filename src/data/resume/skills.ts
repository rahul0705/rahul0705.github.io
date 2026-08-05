export interface SkillCatalogEntry {
  name: string;
  description: string;
  href?: string;
  trackExperienceCoverage?: boolean;
}

export const skillCatalog = {
  java: {
    name: 'Java',
    description: 'Programming Language',
    href: 'https://www.java.com/en/',
    trackExperienceCoverage: true,
  },
  typescript: {
    name: 'TypeScript',
    description: 'Programming Language',
    href: 'https://www.typescriptlang.org/',
    trackExperienceCoverage: true,
  },
  react: {
    name: 'React',
    description: 'JavaScript Library',
    href: 'https://react.dev/',
    trackExperienceCoverage: true,
  },
  cypress: {
    name: 'Cypress',
    description: 'JavaScript End-to-End Testing Library',
    href: 'https://www.cypress.io/',
    trackExperienceCoverage: true,
  },
  cdk: {
    name: 'CDK',
    description: 'Infrastructure as Code Tool',
    href: 'https://aws.amazon.com/cdk/',
    trackExperienceCoverage: true,
  },
  aws: {
    name: 'AWS',
    description: 'Cloud Service Provider',
    href: 'https://aws.amazon.com/',
    trackExperienceCoverage: true,
  },
  agileScrum: {
    name: 'Agile Scrum',
    description: 'Software Development Methodology',
    href: 'https://en.wikipedia.org/wiki/Scrum_(software_development)',
  },
  evms: {
    name: 'EVMS',
    description: 'Project Management Technique',
    href: 'https://en.wikipedia.org/wiki/Earned_value_management',
  },
  ansible: {
    name: 'Ansible',
    description: 'Automation Tool',
    href: 'https://www.ansible.com/',
    trackExperienceCoverage: true,
  },
  python: {
    name: 'Python',
    description: 'Programming Language',
    href: 'https://www.python.org/',
    trackExperienceCoverage: true,
  },
  javascript: {
    name: 'JavaScript',
    description: 'Programming Language',
    href: 'https://www.javascript.com/',
    trackExperienceCoverage: true,
  },
  nodejs: {
    name: 'Node.js',
    description: 'JavaScript Runtime',
    href: 'https://nodejs.org/',
    trackExperienceCoverage: true,
  },
  git: {
    name: 'Git',
    description: 'Software Configuration Management',
    href: 'https://git-scm.com/',
    trackExperienceCoverage: true,
  },
  groovy: {
    name: 'Groovy',
    description: 'Programming Language',
    href: 'https://groovy-lang.org/',
    trackExperienceCoverage: true,
  },
  magicDraw: {
    name: 'MagicDraw',
    description: 'Software Modeling Tool',
    href: 'https://www.3ds.com/products-services/catia/products/no-magic/magicdraw/',
    trackExperienceCoverage: true,
  },
  c: {
    name: 'C',
    description: 'Programming Language',
    href: 'https://www.open-std.org/jtc1/sc22/wg14/',
    trackExperienceCoverage: true,
  },
  rabbitmq: {
    name: 'RabbitMQ',
    description: 'Messaging Queue',
    href: 'https://www.rabbitmq.com/',
    trackExperienceCoverage: true,
  },
  netcdf: {
    name: 'netCDF',
    description: 'Data Format',
    href: 'https://www.unidata.ucar.edu/software/netcdf/',
    trackExperienceCoverage: true,
  },
  flask: {
    name: 'Flask',
    description: 'Python Framework',
    href: 'https://flask.palletsprojects.com/',
    trackExperienceCoverage: true,
  },
  clearCase: {
    name: 'ClearCase',
    description: 'Software Configuration Management',
    href: 'https://www.ibm.com/products/rational-clearcase',
    trackExperienceCoverage: true,
  },
  oracleCoherence: {
    name: 'Oracle Coherence',
    description: 'In-memory Data Grid',
    href: 'https://www.oracle.com/middleware/technologies/coherence.html',
    trackExperienceCoverage: true,
  },
  tcpIp: { name: 'TCP/IP', description: 'Internet protocol suite.' },
  distributedSystems: {
    name: 'Distributed Systems',
    description: 'Systems that coordinate work across multiple machines.',
  },
  osProgramming: { name: 'OS Programming', description: 'Operating system-level software development.' },
  networkTesting: { name: 'Network Testing', description: 'Validation of network behavior and reliability.' },
  softwareTesting: { name: 'Software Testing', description: 'Validation of software quality and behavior.' },
  workInstructions: { name: 'Work Instructions', description: 'Operational and implementation documentation.' },
  designDocumentation: { name: 'Design Documentation', description: 'Technical design communication.' },
  codeReviews: { name: 'Code Reviews', description: 'Collaborative source-code quality review.' },
  presentationProficiency: {
    name: 'Presentation Proficiency',
    description: 'Clear communication of technical work to stakeholders.',
  },
  costSavingsAnalysis: {
    name: 'Cost Savings Analysis',
    description: 'Evaluation of cost and efficiency improvements.',
  },
  perl: {
    name: 'Perl',
    description: 'Programming Language',
    href: 'https://www.perl.org/',
    trackExperienceCoverage: true,
  },
  leadership: { name: 'Leadership', description: 'Guiding teams and coordinating work.' },
  organization: { name: 'Organization', description: 'Planning and coordinating work.' },
  recruiting: { name: 'Recruiting', description: 'Hiring and candidate evaluation.' },
  training: { name: 'Training', description: 'Onboarding and skill development.' },
  attentive: { name: 'Attentive', description: 'Careful attention to customer and operational needs.' },
  ticketSystems: { name: 'Ticket Systems', description: 'Tracking and resolving support requests.' },
  windowsAdministration: {
    name: 'Windows Administration',
    description: 'Administration of Windows systems and domains.',
  },
  networkAdministration: {
    name: 'Network Administration',
    description: 'Administration of network systems and services.',
  },
  softwareMaintenance: { name: 'Software Maintenance', description: 'Ongoing support and upkeep of software systems.' },
  teamCoordination: { name: 'Team Coordination', description: 'Coordinating work across people and teams.' },
  customerRelations: { name: 'Customer Relations', description: 'Supporting customers and understanding their needs.' },
  computerScience: {
    name: 'Computer Science',
    description: 'Study of computation, algorithms, and software systems.',
    href: 'https://www.cs.purdue.edu/',
  },
} as const satisfies Record<string, SkillCatalogEntry>;

export type SkillId = keyof typeof skillCatalog;
