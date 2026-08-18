import { blogContentModel } from './blog';
import { experienceContentModel } from './experience';
import { financialScopeContentModel } from './financial-scopes';
import { skillContentModel } from './skills';

export const contentModels = [
  blogContentModel,
  skillContentModel,
  financialScopeContentModel,
  experienceContentModel,
] as const;
