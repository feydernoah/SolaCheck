import { defineConfig } from 'eslint/config'
import eslintPlugin from '@eslint/js'
import { configs as tseslintConfigs } from 'typescript-eslint'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y'
import nextPlugin from '@next/eslint-plugin-next'

// Global ignores configuration
const ignoresConfig = defineConfig([
    {
        name: 'project/ignores',
        ignores: [
            '.next/',
            'node_modules/',
            'public/',
            '.vscode/',
            'next-env.d.ts',
            'playwright-report/',
            'test-results/',
            'build/',
            'dist/',
        ]
    },
])

// ESLint recommended rules for JavaScript/TypeScript
const eslintConfig = defineConfig([
    {
        name: 'project/javascript-recommended',
        files: ['**/*.{js,mjs,ts,tsx}'],
        ...eslintPlugin.configs.recommended,
    },
    {
        name: 'project/commonjs-files',
        files: ['*.config.js', 'postcss.config.js'],
        languageOptions: {
            globals: {
                require: 'readonly',
                module: 'readonly',
                process: 'readonly',
                __dirname: 'readonly',
            },
        },
    },
])

// TypeScript configuration with type-checked rules
const typescriptConfig = defineConfig([
    {
        name: 'project/typescript-strict',
        files: ['**/*.{ts,tsx,mjs}'],
        extends: [
            ...tseslintConfigs.strictTypeChecked,
            ...tseslintConfigs.stylisticTypeChecked,
        ],
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
                ecmaFeatures: {
                    jsx: true,
                },
                warnOnUnsupportedTypeScriptVersion: true,
            },
        },
        rules: {
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/triple-slash-reference': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/no-unsafe-return': 'off',
            '@typescript-eslint/require-await': 'warn',
            '@typescript-eslint/no-unnecessary-condition': 'warn',
            '@typescript-eslint/no-confusing-void-expression': 'off',
            '@typescript-eslint/restrict-template-expressions': 'warn',
        },
    },
    {
        name: 'project/javascript-disable-type-check',
        files: ['**/*.{js,mjs,cjs}'],
        ...tseslintConfigs.disableTypeChecked,
    }
])

// React and Next.js configuration
const reactConfig = defineConfig([
    {
        name: 'project/react-next',
        files: ['**/*.{jsx,tsx}'],
        plugins: {
            'react': reactPlugin,
            'react-hooks': reactHooksPlugin,
            'jsx-a11y': jsxA11yPlugin,
            '@next/next': nextPlugin,
        },
        rules: {
            ...reactPlugin.configs.recommended.rules,
            ...reactPlugin.configs['jsx-runtime'].rules,
            ...reactHooksPlugin.configs['recommended-latest'].rules,
            ...jsxA11yPlugin.configs.strict.rules,
            ...nextPlugin.configs.recommended.rules,
            ...nextPlugin.configs['core-web-vitals'].rules,
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
            'react/no-unknown-property': 'off',
            'react/jsx-no-target-blank': 'off',
            'jsx-a11y/alt-text': ['warn', { elements: ['img'], img: ['Image'] }],
            'jsx-a11y/media-has-caption': 'warn',
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
    }
])

// Export the complete configuration
export default defineConfig([
    ...ignoresConfig,
    ...eslintConfig,
    ...typescriptConfig,
    ...reactConfig,
])
