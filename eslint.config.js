import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    ignores: ['eslint.config.js'], // Excludes eslint.config.js from being linted
    languageOptions: {
      globals: {
        require: 'readonly',
        module: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': 'warn', // Warns about variables that are declared but not used
      'no-undef': 'warn', // Warns about the use of undeclared variables
      eqeqeq: 'error', // Requires the use of === and !== instead of == and !=
      curly: 'error', // Requires curly brace conventions for all control statements
      'no-redeclare': 'error', // Disallows redeclaring variables
      'no-console': 'warn', // Warns about the use of console (useful in production code)
      'no-debugger': 'error', // Disallows the use of debugger
      'no-trailing-spaces': 'error', // Disallows trailing whitespace at the end of lines
      'no-multi-spaces': 'error', // Disallows multiple spaces (except for indentation)
      'no-unused-expressions': 'warn', // Warns about unused expressions which have no effect
      'prefer-const': 'warn', // Suggests using const declaration for variables that are never reassigned after declared
      'arrow-spacing': ['error', { before: true, after: true }], // Enforces consistent spacing before and after the arrow in arrow functions
      indent: ['error', 2], // Enforces a consistent indentation style
      semi: ['error', 'always'], // Requires semicolons at the end of statements
    },
  },
];
