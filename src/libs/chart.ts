import QuickChart from 'quickchart-js'
import sharp from 'sharp'

import { type LanguageStats } from './github'

const chartSize = 150 // In pixels.
const chartBackgroundColor = 'transparent'

const chartDefinitions = [
  ['dark', '#868e96'],
  ['light', '#212529'],
] as const

export async function generateLanguageStatsCharts(languageStats: LanguageStats) {
  const backgroundColor: string[] = []
  const data: number[] = []
  const labels: string[] = []

  for (const languageStat of languageStats) {
    backgroundColor.push(languageStat.colors.dark)
    data.push(languageStat.size)
    labels.push(languageStat.name)
  }

  for (const [prefix, borderColor] of chartDefinitions) {
    const chart = await generateChart(
      chartSize,
      chartSize,
      chartBackgroundColor,
      borderColor,
      backgroundColor,
      data,
      labels
    )

    const chartData = await chart.toBinary()

    await sharp(chartData).webp().toFile(`public/images/chart-languages-${prefix}.webp`)
  }
}

async function generateChart(
  width: number,
  height: number,
  backgroundColor: string,
  borderColor: string,
  backgroundColors: string[],
  data: number[],
  labels: string[]
) {
  const chart = getNewChart(width, height, backgroundColor)

  chart.setConfig({
    data: {
      datasets: [
        {
          backgroundColor: backgroundColors,
          borderColor,
          borderWidth: 1,
          data,
        },
      ],
      labels,
    },
    options: {
      plugins: {
        datalabels: {
          display: false,
        },
        legend: {
          display: false,
        },
      },
    },
    type: 'doughnut',
  })

  return chart
}

function getNewChart(width: number, height: number, backgroundColor: string) {
  const chart = new QuickChart()
  chart.setBackgroundColor(backgroundColor)
  chart.setDevicePixelRatio(2)
  chart.setVersion('3')
  chart.setWidth(width)
  chart.setHeight(height)

  return chart
}
