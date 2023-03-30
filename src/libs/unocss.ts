import { type AstroIntegrationConfig } from '@unocss/astro'

export function getUnoCSSConfiguration(): AstroIntegrationConfig {
  return {
    rules: [
      [
        'bg-grid',
        {
          'background-image':
            'linear-gradient(hsl(240 6% 90%) 1px, transparent 1px), linear-gradient(to right, hsl(240 6% 90%) 1px, hsl(0 0% 98%) 1px)',
          'background-size': '21px 21px',
        },
      ],
      [
        'bg-grid-dark',
        {
          'background-image':
            'linear-gradient(hsl(240 6% 10%) 1px, transparent 1px), linear-gradient(to right, hsl(240 6% 10%) 1px, hsl(240 10% 4%) 1px)',
          'background-size': '21px 21px',
        },
      ],
    ],
  }
}
