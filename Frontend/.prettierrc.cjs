module.exports = {
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  bracketSpacing: true,
  arrowParens: 'always',
  endOfLine: 'lf',
  overrides: [
    { files: '*.html', options: { printWidth: 120 } },
    { files: '*.md', options: { proseWrap: 'always' } },
  ],
};
