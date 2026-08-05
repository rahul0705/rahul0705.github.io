import type { SkillId } from './skills';

export interface ExperienceRole {
  title: string;
  href?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  highlights?: string[];
  skills?: SkillId[];
}

export interface ExperienceProject {
  name: string;
  roles: ExperienceRole[];
}

export interface ExperienceOrganization {
  name: string;
  href?: string;
  projects: ExperienceProject[];
}

const marketingTechnology: ExperienceProject = {
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
      skills: ['java', 'typescript', 'react', 'cypress', 'cdk', 'aws', 'agileScrum'],
    },
  ],
};

export const amazonWebServices: ExperienceOrganization = {
  name: 'Amazon Web Services',
  href: 'https://en.wikipedia.org/wiki/Amazon_Web_Services',
  projects: [marketingTechnology],
};

const rfims: ExperienceProject = {
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
      skills: ['evms', 'ansible', 'aws', 'agileScrum'],
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
      skills: ['python', 'ansible', 'javascript', 'nodejs', 'react', 'aws', 'git', 'groovy', 'agileScrum', 'magicDraw'],
    },
  ],
};

const wxConnect: ExperienceProject = {
  name: 'WxConnect',
  roles: [
    {
      title: 'Software Engineer',
      startDate: '2016-09',
      endDate: '2018-07',
      description:
        'Delivered enhancements for weather-product processing and overhauled automated deployment, reducing deployment time and allowing customer-led upgrades.',
      highlights: ['Performed root-cause analysis for corrupted weather products.'],
      skills: ['python', 'ansible', 'git'],
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
      skills: ['python', 'c', 'rabbitmq', 'netcdf', 'flask', 'git'],
    },
  ],
};

const goes: ExperienceProject = {
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
      skills: ['java', 'clearCase', 'oracleCoherence'],
    },
  ],
};

const internalResearchAndDevelopment: ExperienceProject = {
  name: 'Internal Research and Development',
  roles: [
    {
      title: 'Software Engineer',
      startDate: '2013-07',
      endDate: '2013-12',
      description:
        "Developed a prototype integrating Harris' Advanced Radar Processing system with Harris' Service Architecture.",
      skills: ['java'],
    },
  ],
};

export const l3HarrisTechnologies: ExperienceOrganization = {
  name: 'L3Harris Technologies',
  href: 'https://en.wikipedia.org/wiki/L3Harris_Technologies',
  projects: [rfims, wxConnect, goes, internalResearchAndDevelopment],
};

export const professorCharlesKillian: ExperienceOrganization = {
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
          skills: ['tcpIp', 'distributedSystems', 'osProgramming', 'networkTesting', 'softwareTesting', 'c'],
        },
      ],
    },
  ],
};

export const bostonScientific: ExperienceOrganization = {
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
          skills: [
            'workInstructions',
            'designDocumentation',
            'codeReviews',
            'presentationProficiency',
            'costSavingsAnalysis',
            'perl',
          ],
        },
      ],
    },
  ],
};

export const beadsEnterprises: ExperienceOrganization = {
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
          skills: ['leadership', 'organization', 'recruiting', 'training', 'attentive'],
        },
      ],
    },
  ],
};

export const purdueEaps: ExperienceOrganization = {
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
          skills: [
            'ticketSystems',
            'windowsAdministration',
            'networkAdministration',
            'softwareMaintenance',
            'teamCoordination',
            'customerRelations',
          ],
        },
      ],
    },
  ],
};

export const experience: ExperienceOrganization[] = [
  amazonWebServices,
  l3HarrisTechnologies,
  professorCharlesKillian,
  bostonScientific,
  beadsEnterprises,
  purdueEaps,
];
