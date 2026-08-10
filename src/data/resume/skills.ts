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
  amazonApiGateway: {
    name: 'Amazon API Gateway',
    description: 'AWS managed service for creating, publishing, and securing APIs.',
    href: 'https://aws.amazon.com/api-gateway/',
    trackExperienceCoverage: true,
  },
  amazonCloudWatch: {
    name: 'Amazon CloudWatch',
    description: 'AWS observability service for metrics, logs, dashboards, and alarms.',
    href: 'https://aws.amazon.com/cloudwatch/',
    trackExperienceCoverage: true,
  },
  amazonDynamoDb: {
    name: 'Amazon DynamoDB',
    description: 'AWS managed NoSQL database service.',
    href: 'https://aws.amazon.com/dynamodb/',
    trackExperienceCoverage: true,
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
  amazonRoute53: {
    name: 'Amazon Route 53',
    description: 'AWS managed Domain Name System and traffic-routing service.',
    href: 'https://aws.amazon.com/route53/',
    trackExperienceCoverage: true,
  },
  amazonS3: {
    name: 'Amazon S3',
    description: 'AWS object storage service.',
    href: 'https://aws.amazon.com/s3/',
    trackExperienceCoverage: true,
  },
  amazonSns: {
    name: 'Amazon SNS',
    description: 'AWS managed publish-and-subscribe messaging service.',
    href: 'https://aws.amazon.com/sns/',
    trackExperienceCoverage: true,
  },
  amazonSqs: {
    name: 'Amazon SQS',
    description: 'AWS managed message queue service.',
    href: 'https://aws.amazon.com/sqs/',
    trackExperienceCoverage: true,
  },
  amazonVpc: {
    name: 'Amazon VPC',
    description: 'AWS service for isolated virtual networks.',
    href: 'https://aws.amazon.com/vpc/',
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
  awsBackup: {
    name: 'AWS Backup',
    description: 'AWS centralized data-protection and backup service.',
    href: 'https://aws.amazon.com/backup/',
    trackExperienceCoverage: true,
  },
  awsCloudTrail: {
    name: 'AWS CloudTrail',
    description: 'AWS service for recording account activity and API events.',
    href: 'https://aws.amazon.com/cloudtrail/',
    trackExperienceCoverage: true,
  },
  awsCodeBuild: {
    name: 'AWS CodeBuild',
    description: 'AWS managed build and test service.',
    href: 'https://aws.amazon.com/codebuild/',
    trackExperienceCoverage: true,
  },
  awsCodePipeline: {
    name: 'AWS CodePipeline',
    description: 'AWS managed continuous-delivery service.',
    href: 'https://aws.amazon.com/codepipeline/',
    trackExperienceCoverage: true,
  },
  awsConfig: {
    name: 'AWS Config',
    description: 'AWS resource configuration, inventory, and compliance service.',
    href: 'https://aws.amazon.com/config/',
    trackExperienceCoverage: true,
  },
  awsIam: {
    name: 'AWS IAM',
    description: 'AWS identity and access management service.',
    href: 'https://aws.amazon.com/iam/',
    trackExperienceCoverage: true,
  },
  awsKms: {
    name: 'AWS KMS',
    description: 'AWS managed encryption-key service.',
    href: 'https://aws.amazon.com/kms/',
    trackExperienceCoverage: true,
  },
  awsLambda: {
    name: 'AWS Lambda',
    description: 'AWS serverless compute service.',
    href: 'https://aws.amazon.com/lambda/',
    trackExperienceCoverage: true,
  },
  awsSecretsManager: {
    name: 'AWS Secrets Manager',
    description: 'AWS service for storing and rotating application secrets.',
    href: 'https://aws.amazon.com/secrets-manager/',
    trackExperienceCoverage: true,
  },
  awsStepFunctions: {
    name: 'AWS Step Functions',
    description: 'AWS serverless workflow orchestration service.',
    href: 'https://aws.amazon.com/step-functions/',
    trackExperienceCoverage: true,
  },
  awsSystemsManager: {
    name: 'AWS Systems Manager',
    description: 'AWS service for managing infrastructure, operations, and application resources.',
    href: 'https://aws.amazon.com/systems-manager/',
    trackExperienceCoverage: true,
  },
  awsWaf: {
    name: 'AWS WAF',
    description: 'AWS web application firewall service.',
    href: 'https://aws.amazon.com/waf/',
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
  elasticLoadBalancing: {
    name: 'Elastic Load Balancing',
    description: 'AWS service for distributing traffic across application targets.',
    href: 'https://aws.amazon.com/elasticloadbalancing/',
    trackExperienceCoverage: true,
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
  terraform: {
    name: 'Terraform',
    description: 'Infrastructure as code tool.',
    href: 'https://developer.hashicorp.com/terraform',
    trackExperienceCoverage: true,
  },
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
