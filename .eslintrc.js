module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'plugin:prettier/recommended'
  ],
  plugins: ['@typescript-eslint'],
  ignorePatterns: ['!.prettierrc.js'],
  settings: {
    react: {
      version: 'detect'
    }
  }
}
