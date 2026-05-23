export default {
  '**/*.{ts,js,tsx,jsx,mjs,json,md,mdx,scss,html,yml}': f =>
    `pnpm nx format:write --files=${f.join(',')}`,
  '**/*.{ts,tsx,js,jsx}': 'eslint'
};
