export default {
  '**/*.{ts,js,tsx,jsx,mjs,json,md,mdx,scss,html,yml}': f =>
    `yarn nx format:write --files=${f.join(',')}`,
  '**/*.{ts,tsx,js,jsx}': 'eslint'
};
