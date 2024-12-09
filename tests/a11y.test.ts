import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const paths = ['/', '/projects', '/notes', '/notes/contributing-to-starlight', '/notes/starlight-heading-links']

for (const theme of ['dark', 'light'] as const) {
  test.describe(`${theme} theme`, () => {
    test.use({ colorScheme: theme })

    for (const path of paths) {
      test(`page '${path}' does not have any automatically detectable a11y issues`, async ({ page }) => {
        await page.goto(`http://localhost:4321${path}`)

        const results = await new AxeBuilder({ page }).analyze()

        expect(filterViolations(results.violations)).toEqual([])
      })
    }
  })
}

function filterViolations(violations: Violations) {
  return violations.filter((violation) => {
    /**
     * Ignore the `landmark-complementary-is-top-level` violation that we use for asides.
     *
     * The best action to fix this violation would be to remove the landmark altogether as it's not necessary in this
     * case and switch to the `note` role. Although, this is not possible at the moment due to an issue with NVDA not
     * announcing it and also skipping the associated label for a role not supported.
     *
     * @see https://github.com/nvaccess/nvda/issues/10439
     */
    return violation.id !== 'landmark-complementary-is-top-level'
  })
}

type Violations = Awaited<ReturnType<typeof AxeBuilder.prototype.analyze>>['violations']
