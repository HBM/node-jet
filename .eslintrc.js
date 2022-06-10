module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'plugin:prettier/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended'
  ],
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  ignorePatterns: ['**/app/c/libs/**/*.js', '!.prettierrc.js'],
  // rules: { '@typescript-eslint/ban-ts-ignore': 0 },
  settings: {
    react: {
      version: 'detect'
    }
  }
}
