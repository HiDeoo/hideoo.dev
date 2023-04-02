import { colord } from 'colord'

export function getLanguageColor(color: string) {
  return colord(color).saturate(0.5).toHslString()
}

export function getLanguageDimmedColors(color: string) {
  return {
    dark: colord(color).darken(0.075).toHslString(),
    light: colord(color).lighten(0.075).toHslString(),
  }
}
