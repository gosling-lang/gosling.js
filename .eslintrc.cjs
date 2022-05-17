module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
    ],
    settings: {
        react: { version: "detect" },
    },
    env: { browser: true, node: true },
    rules: {
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
        '@typescript-eslint/no-unused-vars': [
            'error',
            {
                vars: 'all',
                args: 'after-used',
                ignoreRestSiblings: true
            }
        ],
        // https://eslint.org/docs/rules/
        'no-unused-vars': 'off', // must disable the base rule as it can report incorrect errors
        'linebreak-style': ['error', 'unix'],
        'no-console': ['error', { allow: ['warn', 'error'] }],
        'no-trailing-spaces': 'error',
        'no-irregular-whitespace': ['error', { skipComments: true }],
        'no-alert': 'error',
        'prefer-const': 'error',
        'no-case-declarations': 'warn',
        'no-return-assign': 'error',
        'no-useless-call': 'error',
        'no-shadow': 'off', // 'error', // we could enable this later
        'no-useless-concat': 'error',
        "prefer-template": 'error'
    }
};
