// frontend/postcss.config.cjs (The Definitive, CommonJS Fix)

module.exports = {
  plugins: [
    // The official plugin is needed due to version conflicts
    require('@tailwindcss/postcss'),
    require('autoprefixer')
  ]
}