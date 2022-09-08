import { ArcElement, Chart, DoughnutController } from 'chart.js'

Chart.register(ArcElement, DoughnutController)

function getCssVar(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name)
}

function generateLanguageChart() {
  const backgroundColor: string[] = []
  const data: number[] = []
  const labels: string[] = []

  const isDark = document.documentElement.classList.contains('dark')

  for (const languageStats of globalThis.languageStats) {
    backgroundColor.push(isDark ? languageStats.colors.dark : languageStats.colors.light)
    data.push(languageStats.size)
    labels.push(languageStats.name)
  }

  const chart = new Chart('languageChart', {
    data: {
      datasets: [
        {
          backgroundColor,
          borderColor: getCssVar('--card-border-color'),
          borderWidth: 1,
          data,
        },
      ],
      labels,
    },
    options: {
      animation: false,
      events: [],
      responsive: false,
    },
    type: 'doughnut',
  })

  function onThemeChangeHandler() {
    chart.destroy()
    requestAnimationFrame(generateLanguageChart)
  }

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', onThemeChangeHandler, { once: true })
}

requestAnimationFrame(generateLanguageChart)
