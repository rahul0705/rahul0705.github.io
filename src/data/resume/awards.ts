export interface Recognition {
  title: string;
  date?: string;
  description: string;
  highlights?: string[];
  href?: string;
}

export const awards: Recognition[] = [
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
