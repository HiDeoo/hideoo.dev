import postcssGlobalData from '@csstools/postcss-global-data'
import autoprefixer from 'autoprefixer'
import postcssPresetEnv from 'postcss-preset-env'

const postCssConfig = {
  plugins: [
    postcssGlobalData({
      files: ['src/styles/media.css'],
    }),
    postcssPresetEnv({
      stage: 2,
    }),
    autoprefixer(),
  ],
}

export default postCssConfig
