module.exports = {
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'prettier', 'jest'],
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:jest/recommended',
        'plugin:jest/style',
        'plugin:@typescript-eslint/recommended',
        'prettier',
        'prettier/@typescript-eslint',
        'plugin:prettier/recommended'
    ],
    env: {
        browser: true,
        node: true
    },
    parserOptions: {
        project: 'tsconfig.json',
        ecmaVersion: 6,
        sourceType: 'module'
    },
    settings: {
        react: {
            version: "detect"
        }
    },
    rules: {
        // https://github.com/jest-community/eslint-plugin-jest#rules
        'prettier/prettier': 'warn',
        // https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin#supported-rules
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-empty-interface': 'off',
        '@typescript-eslint/prefer-for-of': 'error',
        '@typescript-eslint/no-for-in-array': 'error',
        '@typescript-eslint/no-require-imports': 'error',
        '@typescript-eslint/no-empty-function': 'off', // we need this in HiGlass plugin track
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-namespace': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        'no-unused-vars': 'off', // must disable the base rule as it can report incorrect errors
        '@typescript-eslint/no-unused-vars': [
            'error',
            {
                vars: 'all',
                args: 'after-used',
                ignoreRestSiblings: true
            }
        ],
        // https://eslint.org/docs/rules/
        'linebreak-style': ['error', 'unix'],
        'no-irregular-whitespace': ['error', { skipComments: true }],
        'no-alert': 'error',
        'prefer-const': 'error',
        'no-return-assign': 'error',
        'no-useless-call': 'error',
        'no-shadow': 'error',
        'no-useless-concat': 'error',
        "prefer-template": "error"
    }
};