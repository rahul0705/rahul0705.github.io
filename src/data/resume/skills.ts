export interface SkillCatalogEntry {
  name: string;
  description: string;
  href?: string;
  trackExperienceCoverage?: boolean;
}

export const skillCatalog = {
  agileScrum: {
    name: 'Agile Scrum',
    description: 'Software Development Methodology',
    href: 'https://en.wikipedia.org/wiki/Scrum_(software_development)',
  },
  ansible: {
    name: 'Ansible',
    description: 'Automation Tool',
    href: 'https://www.ansible.com/',
    trackExperienceCoverage: true,
  },
  attentive: { name: 'Attentive', description: 'Careful attention to customer and operational needs.' },
  aws: {
    name: 'AWS',
    description: 'Cloud Service Provider',
    href: 'https://aws.amazon.com/',
    trackExperienceCoverage: true,
  },
  c: {
    name: 'C',
    description: 'Programming Language',
    href: 'https://www.open-std.org/jtc1/sc22/wg14/',
    trackExperienceCoverage: true,
  },
  cdk: {
    name: 'CDK',
    description: 'Infrastructure as Code Tool',
    href: 'https://aws.amazon.com/cdk/',
    trackExperienceCoverage: true,
  },
  clearCase: {
    name: 'ClearCase',
    description: 'Software Configuration Management',
    href: 'https://www.ibm.com/products/rational-clearcase',
    trackExperienceCoverage: true,
  },
  codeReviews: { name: 'Code Reviews', description: 'Collaborative source-code quality review.' },
  computerScience: {
    name: 'Computer Science',
    description: 'Study of computation, algorithms, and software systems.',
    href: 'https://www.cs.purdue.edu/',
  },
  costSavingsAnalysis: {
    name: 'Cost Savings Analysis',
    description: 'Evaluation of cost and efficiency improvements.',
  },
  customerRelations: { name: 'Customer Relations', description: 'Supporting customers and understanding their needs.' },
  cypress: {
    name: 'Cypress',
    description: 'JavaScript End-to-End Testing Library',
    href: 'https://www.cypress.io/',
    trackExperienceCoverage: true,
  },
  designDocumentation: { name: 'Design Documentation', description: 'Technical design communication.' },
  distributedSystems: {
    name: 'Distributed Systems',
    description: 'Systems that coordinate work across multiple machines.',
  },
  evms: {
    name: 'EVMS',
    description: 'Project Management Technique',
    href: 'https://en.wikipedia.org/wiki/Earned_value_management',
  },
  flask: {
    name: 'Flask',
    description: 'Python Framework',
    href: 'https://flask.palletsprojects.com/',
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
  java: {
    name: 'Java',
    description: 'Programming Language',
    href: 'https://www.java.com/en/',
    trackExperienceCoverage: true,
  },
  javascript: {
    name: 'JavaScript',
    description: 'Programming Language',
    href: 'https://www.javascript.com/',
    trackExperienceCoverage: true,
  },
  leadership: { name: 'Leadership', description: 'Guiding teams and coordinating work.' },
  magicDraw: {
    name: 'MagicDraw',
    description: 'Software Modeling Tool',
    href: 'https://www.3ds.com/products-services/catia/products/no-magic/magicdraw/',
    trackExperienceCoverage: true,
  },
  netcdf: {
    name: 'netCDF',
    description: 'Data Format',
    href: 'https://www.unidata.ucar.edu/software/netcdf/',
    trackExperienceCoverage: true,
  },
  networkAdministration: {
    name: 'Network Administration',
    description: 'Administration of network systems and services.',
  },
  networkTesting: { name: 'Network Testing', description: 'Validation of network behavior and reliability.' },
  nodejs: {
    name: 'Node.js',
    description: 'JavaScript Runtime',
    href: 'https://nodejs.org/',
    trackExperienceCoverage: true,
  },
  oracleCoherence: {
    name: 'Oracle Coherence',
    description: 'In-memory Data Grid',
    href: 'https://www.oracle.com/middleware/technologies/coherence.html',
    trackExperienceCoverage: true,
  },
  organization: { name: 'Organization', description: 'Planning and coordinating work.' },
  osProgramming: { name: 'OS Programming', description: 'Operating system-level software development.' },
  perl: {
    name: 'Perl',
    description: 'Programming Language',
    href: 'https://www.perl.org/',
    trackExperienceCoverage: true,
  },
  presentationProficiency: {
    name: 'Presentation Proficiency',
    description: 'Clear communication of technical work to stakeholders.',
  },
  python: {
    name: 'Python',
    description: 'Programming Language',
    href: 'https://www.python.org/',
    trackExperienceCoverage: true,
  },
  rabbitmq: {
    name: 'RabbitMQ',
    description: 'Messaging Queue',
    href: 'https://www.rabbitmq.com/',
    trackExperienceCoverage: true,
  },
  react: {
    name: 'React',
    description: 'JavaScript Library',
    href: 'https://react.dev/',
    trackExperienceCoverage: true,
  },
  recruiting: { name: 'Recruiting', description: 'Hiring and candidate evaluation.' },
  softwareMaintenance: { name: 'Software Maintenance', description: 'Ongoing support and upkeep of software systems.' },
  softwareTesting: { name: 'Software Testing', description: 'Validation of software quality and behavior.' },
  tcpIp: { name: 'TCP/IP', description: 'Internet protocol suite.' },
  teamCoordination: { name: 'Team Coordination', description: 'Coordinating work across people and teams.' },
  ticketSystems: { name: 'Ticket Systems', description: 'Tracking and resolving support requests.' },
  training: { name: 'Training', description: 'Onboarding and skill development.' },
  typescript: {
    name: 'TypeScript',
    description: 'Programming Language',
    href: 'https://www.typescriptlang.org/',
    trackExperienceCoverage: true,
  },
  windowsAdministration: {
    name: 'Windows Administration',
    description: 'Administration of Windows systems and domains.',
  },
  workInstructions: { name: 'Work Instructions', description: 'Operational and implementation documentation.' },
} as const satisfies Record<string, SkillCatalogEntry>;

export type SkillId = keyof typeof skillCatalog;
