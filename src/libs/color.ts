import { colord } from 'colord'

export function getLanguageColors(baseColor: string) {
  const color = colord(baseColor)

  return {
    dark: color.lighten(0.1).alpha(0.2).toHslString(),
    light: color.darken(0.1).alpha(0.15).toHslString(),
  }
}
