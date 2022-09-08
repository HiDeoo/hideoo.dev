import { ArcElement, Chart, DoughnutController } from 'chart.js'

Chart.register(ArcElement, DoughnutController)

let chart: Chart | null = null

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

  if (chart) {
    chart.destroy()
    chart = null
  }

  chart = new Chart('languageChart', {
    data: {
      datasets: [
        {
          backgroundColor,
          borderColor: getComputedStyle(document.documentElement).getPropertyValue('--card-border-color'),
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
}

function onThemeChangeHandler() {
  requestAnimationFrame(generateLanguageChart)
}

requestAnimationFrame(generateLanguageChart)

const themeObserver = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.type !== 'attributes' && mutation.attributeName !== 'class') {
      return
    }

    onThemeChangeHandler()
  }
})

themeObserver.observe(document.documentElement, { attributeFilter: ['class'] })
