import { flavorEntries, flavors } from '@catppuccin/palette';
import { describe, expect, it } from 'vitest';

import { getCatppuccinDaisyOptions, siteTheme, siteThemeColor } from './site-theme';

describe('site theme', () => {
  it('derives its browser color from the active Catppuccin flavor', () => {
    expect(siteThemeColor).toBe(flavors[siteTheme].colors.base.hex);
  });

  it('marks only the active flavor as DaisyUI default', () => {
    const flavorNames = flavorEntries.map(([name]) => name);
    const defaults = flavorNames.filter((flavor) => getCatppuccinDaisyOptions(flavor).default);

    expect(defaults).toEqual([siteTheme]);
  });

  it('marks the active flavor as the preferred dark theme only when it is dark', () => {
    const flavorNames = flavorEntries.map(([name]) => name);

    for (const flavor of flavorNames) {
      expect(getCatppuccinDaisyOptions(flavor).prefersdark).toBe(flavor === siteTheme && flavors[siteTheme].dark);
    }
  });
});
