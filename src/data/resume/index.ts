import { awards } from './awards';
import { basics } from './basics';
import { education } from './education';
import { experience } from './experience';
import { deriveSkillEvidence, type SkillEvidence } from './experience-coverage';
import { interests } from './interests';
import { toResumeJson } from './json';
import { validateSkillIds } from './skills';
import { toResumeMarkdown, toResumeText } from './text';

export interface SkillGroup {
  name: string;
  keywords: string[];
}

const skillGroups: SkillGroup[] = [
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

export const resume = { basics, experience, education, skills: skillGroups, awards, interests };

for (const entry of education) validateSkillIds(entry.skills ?? [], `education entry ${entry.title}`);

export const skillEvidence: SkillEvidence[] = deriveSkillEvidence(resume.experience);

export const resumeJson = toResumeJson({
  basics,
  experience,
  education,
  skillGroups,
  recognitions: awards,
  skillEvidence,
  interests,
});

const resumeTextInput = { basics, experience, education, skillGroups, recognitions: awards, interests };

export const resumeText = toResumeText(resumeTextInput);
export const resumeMarkdown = toResumeMarkdown(resumeTextInput);
