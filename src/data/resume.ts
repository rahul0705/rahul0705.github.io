import { deriveExperienceSkillCoverage } from '../lib/resume-coverage';
import { basics } from './basics';

export type { ExperienceSkillCoverage } from '../lib/resume-coverage';

export interface ResumeEntry {
  title: string;
  href?: string;
  subtitle?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  highlights?: string[];
  tags?: string[];
}

export interface ExperienceCompany {
  name: string;
  href?: string;
  projects: ExperienceProject[];
}

export interface ExperienceProject {
  name: string;
  roles: ResumeEntry[];
}

interface SkillGroup {
  name: string;
  keywords: string[];
}

interface Award {
  title: string;
  date?: string;
  description: string;
  highlights?: string[];
  href?: string;
}

const experience: ExperienceCompany[] = [
  {
    name: 'Amazon Web Services',
    href: 'https://en.wikipedia.org/wiki/Amazon_Web_Services',
    projects: [
      {
        name: 'Marketing Technology',
        roles: [
          {
            title: 'Software Development Engineer',
            startDate: '2021-08',
            description:
              'Developed and extended a self-service tool that enables marketing at AWS scale. The platform helps end users measure campaign impact, iterate faster, and create more precise customer communication.',
            highlights: [
              'Planned and implemented software features for external customers.',
              'Planned and implemented third-party tool integrations for external customers.',
            ],
            tags: ['Java', 'TypeScript', 'React', 'Cypress', 'CDK', 'AWS', 'Agile Scrum'],
          },
        ],
      },
    ],
  },
  {
    name: 'L3Harris Technologies',
    href: 'https://en.wikipedia.org/wiki/L3Harris_Technologies',
    projects: [
      {
        name: 'RFIMS',
        roles: [
          {
            title: 'Chief Software Engineer',
            startDate: '2019-06',
            description:
              'Led software for a system that analyzes radio-frequency data, with collection on purpose-built embedded systems and classification in an AWS cloud environment.',
            highlights: [
              'Provided architectural guidance and oversight for the technical direction and implementation of the project.',
              'Managed software budget and schedule in conformance with EVMS.',
              'Coordinated team efforts to meet customer expectations and requirements.',
              'Implemented controls and audits supporting ATO in a GovCloud environment.',
              'Planned and implemented software tasks for internal teams and external customers.',
            ],
            tags: ['EVMS', 'Ansible', 'AWS', 'Agile Scrum'],
          },
          {
            title: 'Lead Software Engineer',
            startDate: '2018-07',
            endDate: '2019-06',
            description:
              'Led a small team and served as scrum master for a radio-frequency data analysis system using embedded collection systems and AWS-based classification.',
            highlights: [
              'Created large portions of the cloud architecture for classifying data.',
              'Implemented cloud-infrastructure automation to support DevOps practices.',
              'Pioneered continuous integration within the project.',
            ],
            tags: ['Python', 'Ansible', 'JavaScript', 'Node.js', 'React', 'AWS', 'Git', 'Groovy', 'MagicDraw'],
          },
        ],
      },
      {
        name: 'WxConnect',
        roles: [
          {
            title: 'Software Engineer',
            startDate: '2016-09',
            endDate: '2018-07',
            description:
              'Delivered enhancements for weather-product processing and overhauled automated deployment, reducing deployment time and allowing customer-led upgrades.',
            highlights: ['Performed root-cause analysis for corrupted weather products.'],
            tags: ['Python', 'Ansible', 'Git'],
          },
          {
            title: 'Software Engineer',
            startDate: '2014-01',
            endDate: '2016-04',
            description:
              'Designed and developed direct-receive solutions for environmental satellites, including management, monitoring, REST interfaces, and data-recovery capabilities.',
            highlights: [
              'Implemented initial data recovery from GOES satellites to netCDF files.',
              'Implemented data recovery from Himawari satellites.',
            ],
            tags: ['Python', 'C', 'RabbitMQ', 'netCDF', 'Flask', 'Git'],
          },
        ],
      },
      {
        name: 'GOES',
        roles: [
          {
            title: 'Software Engineer',
            startDate: '2016-04',
            endDate: '2016-09',
            description:
              'Pioneered a memory and CPU footprint improvement initiative for the GOES-R program, enabling additional processing without modifying existing infrastructure.',
            highlights: [
              'Analyzed Oracle Coherence data-grid usage and implemented a segmentation approach to reduce its footprint.',
            ],
            tags: ['Java', 'ClearCase', 'Oracle Coherence'],
          },
        ],
      },
      {
        name: 'Internal Research and Development',
        roles: [
          {
            title: 'Software Engineer',
            startDate: '2013-07',
            endDate: '2013-12',
            description:
              "Developed a prototype integrating Harris' Advanced Radar Processing system with Harris' Service Architecture.",
            tags: ['Java'],
          },
        ],
      },
    ],
  },
  {
    name: 'Professor Charles Killian',
    projects: [
      {
        name: 'TCP Keep-Alive Research',
        roles: [
          {
            title: 'Research Assistant',
            startDate: '2012-09',
            endDate: '2012-12',
            description:
              'Tested TCP keep-alive implementations through distributed-system and node failures to create fault-tolerant code and compare operating-system behavior.',
            tags: ['TCP/IP', 'Distributed Systems', 'OS Programming', 'Network Testing', 'Software Testing', 'C'],
          },
        ],
      },
    ],
  },
  {
    name: 'Boston Scientific',
    href: 'https://en.wikipedia.org/wiki/Boston_Scientific',
    projects: [
      {
        name: 'Clinical Study Data Migration',
        roles: [
          {
            title: 'Intern / Project Manager / Developer / Business Analyst',
            startDate: '2012-05',
            endDate: '2012-08',
            description:
              'Developed a process and tools to migrate clinical studies between Electronic Data Capture systems, coordinated vendor solutions, and presented the approach to the CIO.',
            tags: ['Work Instructions', 'Design Documentation', 'Code Reviews', 'Cost Savings Analysis', 'Perl'],
          },
        ],
      },
    ],
  },
  {
    name: 'Beads Enterprises LLC (USA)',
    projects: [
      {
        name: 'Pandora Store Opening',
        roles: [
          {
            title: 'Assistant',
            startDate: '2011-05',
            endDate: '2011-08',
            description:
              'Supported the opening of a new Pandora store through hiring, advertising, inventory control, and operational-process improvements.',
            tags: ['Leadership', 'Organization', 'Recruiting', 'Training'],
          },
        ],
      },
    ],
  },
  {
    name: 'Purdue University Department of Earth, Atmospheric, and Planetary Sciences',
    href: 'https://www.eaps.purdue.edu/',
    projects: [
      {
        name: 'IT Support',
        roles: [
          {
            title: 'ITA',
            startDate: '2010-01',
            endDate: '2012-05',
            description: 'Resolved faculty and staff computer issues and managed a Windows domain of 100 workstations.',
            tags: ['Windows Administration', 'Network Administration', 'Software Maintenance', 'Customer Relations'],
          },
        ],
      },
    ],
  },
];

const education: ResumeEntry[] = [
  {
    title: 'Purdue University',
    href: 'https://www.purdue.edu/',
    subtitle: "Bachelor's Degree in Computer Science",
    endDate: '2013-05',
    tags: ['Computer Science'],
  },
  {
    title: 'Palmer Trinity School',
    href: 'https://www.palmertrinity.org/',
    subtitle: 'High School Degree',
    endDate: '2009-05',
  },
];

const skills: SkillGroup[] = [
  { name: 'Languages', keywords: ['Spanish (fluent)'] },
  { name: 'Operating Systems', keywords: ['Windows', 'macOS', 'GNU/Linux'] },
  {
    name: 'Specializations',
    keywords: ['Automation', 'DevOps', 'Cloud', 'Embedded Systems', 'Networking', 'Security'],
  },
  {
    name: 'Relevant Coursework',
    keywords: [
      'Data Structures and Algorithms',
      'Computer Architecture',
      'Systems Programming',
      'Analysis of Algorithms',
      'Operating Systems',
      'Compilers',
      'Computer Networks',
      'Cryptography',
      'Information Systems',
      'Computer Security',
      'Relational Database Systems',
      'Programmatic Reverse Engineering of Binary Code',
    ],
  },
];

const awards: Award[] = [
  {
    title: 'Harris Engineering Award for Technology Innovation',
    date: '2018',
    description:
      'Recognized for engineering achievements as part of a small group selected from more than 15,000 Harris engineers.',
    highlights: ['Root Cause Analysis', 'Customer Engagement'],
    href: 'https://web.archive.org/web/20200919102224/https://www.harris.com/press-releases/2018/02/harris-corporation-eweek-celebration-inspires-wonder-in-engineering',
  },
  {
    title: 'Presentation to National Security Agency',
    description: 'Developed an IDA Pro plugin to detect algorithms within binaries and aid executable analysis.',
    highlights: ['Python', 'IDA Pro', 'Algorithm Detection', 'x86 Assembly', 'Reverse Engineering'],
    href: '/blog/2013-05-01-algorithm-detection-in-assembly',
  },
  {
    title: 'Google ACM Coding Competition',
    description: 'Placed second by creating Arroz, an application to manage food for college students.',
    highlights: ['Version Control', 'Project Management', 'Google API', 'Java'],
    href: 'https://sites.google.com/site/pudevelopers',
  },
  {
    title: 'Development with the Raspberry Pi',
    description: 'Developed a home automation system and media center using a Raspberry Pi.',
    highlights: ['Embedded Systems', 'ARM Architecture', 'Home Automation', 'Video Encoding', 'Apache'],
    href: 'https://www.raspberrypi.org/',
  },
  {
    title: 'President of ACM Special Interest Group Security',
    description: 'Taught security concepts to students with an interest in security.',
    highlights: ['Peer-to-Peer Protocols', 'Android OS Development', 'Cipher Analysis', 'Reverse Engineering'],
    href: 'https://acm.cs.purdue.edu',
  },
  {
    title: 'ACM Special Interest Group Robotics',
    description: 'Placed thirty-fourth in the VEX Robotics World Championships by constructing and coding two robots.',
    highlights: ['Embedded Systems', 'Artificial Intelligence'],
    href: 'https://www.vexrobotics.com',
  },
];

export const resume = {
  basics,
  experience,
  education,
  skills,
  awards,
};

const programmingAndTooling = new Set([
  'Ansible',
  'Assembly',
  'AWS',
  'C',
  'CDK',
  'ClearCase',
  'Cypress',
  'Flask',
  'Git',
  'Groovy',
  'Java',
  'JavaScript',
  'MagicDraw',
  'netCDF',
  'Node.js',
  'Oracle Coherence',
  'Perl',
  'Python',
  'RabbitMQ',
  'React',
  'TypeScript',
]);

export const experienceSkillCoverage = deriveExperienceSkillCoverage(resume.experience, programmingAndTooling);

export const resumeJson = {
  basics: {
    name: resume.basics.name,
    label: resume.basics.label,
    email: resume.basics.email,
    phone: resume.basics.phone,
    url: resume.basics.url,
    profiles: resume.basics.profiles,
  },
  work: resume.experience.flatMap((company) =>
    company.projects.flatMap((project) =>
      project.roles.map((role) => ({
        name: company.name,
        position: role.title,
        url: company.href,
        startDate: role.startDate,
        endDate: role.endDate,
        summary: role.description,
        highlights: role.highlights,
      })),
    ),
  ),
  education: resume.education.map((entry) => ({
    institution: entry.title,
    url: entry.href,
    area: entry.subtitle,
    endDate: entry.endDate,
  })),
  skills: [
    { name: 'Programming and tooling', keywords: experienceSkillCoverage.map((skill) => skill.name) },
    ...resume.skills.map((group) => ({ name: group.name, keywords: group.keywords })),
  ],
  awards: resume.awards.map((award) => ({
    title: award.title,
    date: award.date,
    summary: award.description,
    highlights: award.highlights,
    url: award.href,
  })),
  meta: {
    canonical: 'https://jsonresume.org/schema',
    version: '1.0.0',
    lastModified: '2026-07-26',
  },
};
