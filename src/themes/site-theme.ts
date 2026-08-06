import { flavors } from '@catppuccin/palette';
import type { FlavorName } from '@catppuccin/palette';

export const siteTheme: FlavorName = 'mocha';
export const siteThemeColor = flavors[siteTheme].colors.base.hex;

export const getCatppuccinDaisyOptions = (theme: FlavorName) => ({
  default: theme === siteTheme,
  prefersdark: theme === siteTheme && flavors[theme].dark,
});
