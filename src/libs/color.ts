import { colord } from 'colord'

export function getLanguageColors(baseColor: string) {
  return colord(baseColor).saturate(0.5).toHslString()
}
