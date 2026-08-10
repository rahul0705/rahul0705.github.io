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
  amazonEc2: {
    name: 'Amazon EC2',
    description: 'AWS virtual compute service.',
    href: 'https://aws.amazon.com/ec2/',
    trackExperienceCoverage: true,
  },
  amazonEcr: {
    name: 'Amazon ECR',
    description: 'AWS managed container registry.',
    href: 'https://aws.amazon.com/ecr/',
    trackExperienceCoverage: true,
  },
  amazonEks: {
    name: 'Amazon EKS',
    description: 'AWS managed Kubernetes service.',
    href: 'https://aws.amazon.com/eks/',
    trackExperienceCoverage: true,
  },
  amazonRds: {
    name: 'Amazon RDS',
    description: 'AWS managed relational database service.',
    href: 'https://aws.amazon.com/rds/',
    trackExperienceCoverage: true,
  },
  amazonS3: {
    name: 'Amazon S3',
    description: 'AWS object storage service.',
    href: 'https://aws.amazon.com/s3/',
    trackExperienceCoverage: true,
  },
  ansible: {
    name: 'Ansible',
    description: 'Automation Tool',
    href: 'https://www.ansible.com/',
    trackExperienceCoverage: true,
  },
  aws: {
    name: 'AWS',
    description: 'Cloud Service Provider',
    href: 'https://aws.amazon.com/',
    trackExperienceCoverage: true,
  },
  awsIam: {
    name: 'AWS IAM',
    description: 'AWS identity and access management service.',
    href: 'https://aws.amazon.com/iam/',
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
  continuousIntegration: {
    name: 'Continuous Integration',
    description: 'Automated build, test, and delivery workflows.',
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
  nistRiskManagementFramework: {
    name: 'NIST Risk Management Framework',
    description: 'Security control assessment and authorization under the NIST Risk Management Framework.',
    href: 'https://csrc.nist.gov/projects/risk-management/about-rmf',
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
  osProgramming: { name: 'OS Programming', description: 'Operating system-level software development.' },
  perl: {
    name: 'Perl',
    description: 'Programming Language',
    href: 'https://www.perl.org/',
    trackExperienceCoverage: true,
  },
  performanceOptimization: {
    name: 'Performance Optimization',
    description: 'Measurement and improvement of software resource utilization and throughput.',
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
  softwareTesting: { name: 'Software Testing', description: 'Validation of software quality and behavior.' },
  systemArchitecture: {
    name: 'System Architecture',
    description: 'Design of software components, interfaces, and deployment topology.',
  },
  tcpIp: { name: 'TCP/IP', description: 'Internet protocol suite.' },
  typescript: {
    name: 'TypeScript',
    description: 'Programming Language',
    href: 'https://www.typescriptlang.org/',
    trackExperienceCoverage: true,
  },
  uiUx: {
    name: 'UI/UX',
    description: 'Design and implementation of usable, consistent user interfaces.',
  },
  workInstructions: { name: 'Work Instructions', description: 'Operational and implementation documentation.' },
} as const satisfies Record<string, SkillCatalogEntry>;

export type SkillId = keyof typeof skillCatalog;
