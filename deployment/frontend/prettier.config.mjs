/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').options} */
const config = {
    plugins: ['prettier-plugin-tailwindcss'],
    // Match ESLint (semi, Next/TS style) to avoid large diffs when running prettier
    semi: true,
    singleQuote: true,
    tabWidth: 4,
    trailingComma: 'es5',
    printWidth: 100,
};

export default config;
