const pluralRules = new Intl.PluralRules('en-US')

export function pluralize(count: number, singular: string, plural: string) {
  const grammaticalNumber = pluralRules.select(count)

  return grammaticalNumber === 'one' ? singular : plural
}
