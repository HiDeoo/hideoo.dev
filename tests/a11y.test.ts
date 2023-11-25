import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

// TODO(HiDeoo) Add some notes
const paths = ['/', '/projects', '/notes']

for (const theme of ['dark', 'light'] as const) {
  test.describe(`${theme} theme`, () => {
    test.use({ colorScheme: theme })

    for (const path of paths) {
      test(`page '${path}' does not have any automatically detectable a11y issues`, async ({ page }) => {
        await page.goto(`http://localhost:4321${path}`)

        const results = await new AxeBuilder({ page }).analyze()

        expect(results.violations).toEqual([])
      })
    }
  })
}
