const autoprefixer = require('autoprefixer')
const openProps = require('open-props')
const postcssJitProps = require('postcss-jit-props')
const postcssPresetEnv = require('postcss-preset-env')

module.exports = {
  plugins: [postcssPresetEnv({ stage: 1 }), postcssJitProps(openProps), autoprefixer()],
}
