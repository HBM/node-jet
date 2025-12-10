import eslinter from 'eslint-config-love'
import { includeIgnoreFile } from '@eslint/compat'
import { fileURLToPath } from 'url'
import path from 'path'

const ignore = includeIgnoreFile(
  path.join(path.dirname(fileURLToPath(import.meta.url)), '.gitignore')
)

const tempDisabledRules = {
  '@typescript-eslint/await-thenable': 'off',
  '@typescript-eslint/class-methods-use-this': 'off',
  '@typescript-eslint/consistent-type-assertions': 'off',
  '@typescript-eslint/explicit-function-return-type': 'off',
  '@typescript-eslint/init-declarations': 'off',
  '@typescript-eslint/no-base-to-string': 'off',
  '@typescript-eslint/no-dynamic-delete': 'off',
  '@typescript-eslint/no-floating-promises': 'off',
  '@typescript-eslint/no-floating-promises': 'off',
  '@typescript-eslint/no-magic-numbers': 'off',
  '@typescript-eslint/no-misused-promises': 'off',
  '@typescript-eslint/no-misused-promises': 'off',
  '@typescript-eslint/no-unnecessary-condition': 'off',
  '@typescript-eslint/no-unnecessary-type-conversion': 'off',
  '@typescript-eslint/no-unnecessary-type-parameters': 'off',
  '@typescript-eslint/no-unsafe-argument': 'off',
  '@typescript-eslint/no-unsafe-assignment': 'off',
  '@typescript-eslint/no-unsafe-call': 'off',
  '@typescript-eslint/no-unsafe-member-access': 'off',
  '@typescript-eslint/no-unsafe-return': 'off',
  '@typescript-eslint/no-unsafe-type-assertion': 'off',
  '@typescript-eslint/only-throw-error': 'off',
  '@typescript-eslint/prefer-destructuring': 'off',
  '@typescript-eslint/prefer-for-of': 'off',
  '@typescript-eslint/prefer-nullish-coalescing': 'off',
  '@typescript-eslint/prefer-promise-reject-errors': 'off',
  '@typescript-eslint/require-await': 'off',
  '@typescript-eslint/restrict-template-expressions': 'off',
  '@typescript-eslint/return-await': 'off',
  '@typescript-eslint/strict-boolean-expressions': 'off',
  '@typescript-eslint/use-unknown-in-catch-callback-variable': 'off',
  'array-callback-return': 'off',
  'eslint-comments/require-description': 'off',
  'import/export': 'off',
  'import/no-duplicates': 'off',
  'logical-assignment-operators': 'off',
  'new-cap': 'off',
  'promise/avoid-new': 'off',
  'valid-typeof': 'off',
  complexity: 'off'
}

export default [
  {
    ...eslinter,
    files: ['src/**/*.{ts,tsx,html}'],
    rules: { ...tempDisabledRules }
  },
  {
    files: ['eslint.config.mjs'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    }
  },
  {
    files: ['**/*.cjs'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'script'
      }
    }
  },
  { ignores: ignore.ignores }
]
