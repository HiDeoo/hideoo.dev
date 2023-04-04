import { colord } from 'colord'

export const LANGUAGE_COLOR_OVERRIDES = {
  CSS: 'hsl(265 85% 50%)',
  JavaScript: 'hsl(45 100% 47%)',
  JSON: 'hsl(145 65% 45%)',
  Lua: 'hsl(230 70% 55%)',
  Shell: 'hsl(145 70% 35%)',
}

export function getLanguageColorOverride(language: string): string | undefined {
  return LANGUAGE_COLOR_OVERRIDES[language as keyof typeof LANGUAGE_COLOR_OVERRIDES]
}

export function getLanguageColor(color: string) {
  return colord(color).saturate(0.5).toHslString()
}

export function getLanguageDimmedColors(color: string) {
  return {
    dark: colord(color).darken(0.075).toHslString(),
    light: colord(color).lighten(0.075).toHslString(),
  }
}
